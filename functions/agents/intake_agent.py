# agents/intake_curation_agent.py

from typing import Dict, List, Any, Optional
import json
import logging
import re
from datetime import datetime

# Google Cloud imports
try:
    from google.cloud import speech_v2 as speech
    import vertexai
    from vertexai.generative_models import GenerativeModel, Part
    GOOGLE_AVAILABLE = True
except ImportError:
    GOOGLE_AVAILABLE = False
    
# Suppress noisy Google Cloud logging
logging.getLogger('google.api_core').setLevel(logging.WARNING)
logging.getLogger('google.auth').setLevel(logging.WARNING)


class IntakeCurationAgent:
    """
    Agent 1: Intake & Curation
    Standardizes raw, founder-submitted data (PDFs, media files) into a structured JSON memo.
    This is the first gatekeeper in the analysis pipeline.
    """

    def __init__(
        self,
        model: str = "gemini-2.5-pro",
        project: str = "",
        location: str = "asia-south1"
    ):
        """
        Initializes the agent's configuration.
        
        Args:
            model (str): The name of the Gemini model to use.
            project (str): The Google Cloud project ID.
            location (str): The Google Cloud location for Vertex AI services.
        """
        self.model_name = model
        self.project = project
        self.location = location
        
        # Setup professional logging
        self.logger = logging.getLogger(self.__class__.__name__)
        if not self.logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
            handler.setFormatter(formatter)
            self.logger.addHandler(handler)
            self.logger.setLevel(logging.INFO)

        # Initialize Google Cloud clients to None
        self.gemini_model = None
        self.speech_client = None

    def set_up(self):
        """Initializes all necessary Google Cloud clients and models."""
        self.logger.info(f"Setting up IntakeCurationAgent for project '{self.project}'...")
        if not GOOGLE_AVAILABLE:
            self.logger.error("Google Cloud libraries are not installed. Please run 'pip install google-cloud-aiplatform google-cloud-speech'.")
            raise ImportError("Required Google Cloud libraries are missing.")
        
        try:
            # Initialize Vertex AI
            vertexai.init(project=self.project, location=self.location)
            self.logger.info(f"Vertex AI initialized in project '{self.project}' and location '{self.location}'.")
            
            # Initialize Gemini Model
            self.gemini_model = GenerativeModel(self.model_name)
            self.logger.info(f"GenerativeModel ('{self.model_name}') initialized successfully.")
            
            # Initialize Speech-to-Text Client
            self.speech_client = speech.SpeechClient()
            self.logger.info("SpeechClient initialized successfully.")

            self.logger.info("✅ IntakeCurationAgent setup complete.")
            
        except Exception as e:
            self.logger.error(f"Failed to initialize agent's Google Cloud clients: {e}", exc_info=True)
            raise

    def run(self, file_data: bytes, filename: str, file_type: str) -> Dict[str, Any]:
        """
        Main entry point for the agent. Processes a single file and generates Memo 1.

        Args:
            file_data (bytes): The raw byte content of the file.
            filename (str): The original name of the file.
            file_type (str): The type of file ('pdf', 'video', 'audio').

        Returns:
            Dict[str, Any]: A structured dictionary containing the processing status and results.
        """
        start_time = datetime.now()
        self.logger.info(f"Starting intake process for '{filename}' (type: {file_type})...")
        
        try:
            extracted_text = ""
            if file_type == 'pdf':
                # For PDFs, we generate the memo directly to avoid a two-step process
                memo_1_json = self._process_pdf_and_generate_memo(file_data)
            elif file_type in ['video', 'audio']:
                # For media, we first transcribe, then generate the memo
                extracted_text = self._process_media(file_data, file_type)
                memo_1_json = self._generate_memo_from_text(extracted_text, "pitch transcript")
            else:
                raise ValueError(f"Unsupported file type: {file_type}")

            processing_time = (datetime.now() - start_time).total_seconds()
            self.logger.info(f"Successfully processed '{filename}' in {processing_time:.2f} seconds.")

            return {
                "timestamp": datetime.now().isoformat(),
                "processing_time_seconds": processing_time,
                "memo_1": memo_1_json,
                "original_filename": filename,
                "status": "SUCCESS"
            }
            
        except Exception as e:
            self.logger.error(f"Error during intake process for '{filename}': {e}", exc_info=True)
            processing_time = (datetime.now() - start_time).total_seconds()
            
            return {
                "timestamp": datetime.now().isoformat(),
                "processing_time_seconds": processing_time,
                "memo_1": {},
                "status": "FAILED",
                "error": str(e)
            }

    def _process_pdf_and_generate_memo(self, file_data: bytes) -> Dict[str, Any]:
        """Processes a PDF file using Gemini and generates Memo 1 in a single call."""
        self.logger.info("Processing PDF with Gemini to generate Memo 1...")
        pdf_part = Part.from_data(data=file_data, mime_type="application/pdf")
        
        prompt = """
        You are an AI Venture Capital Analyst. Analyze the attached pitch deck document.
        Your task is to perform an initial summary and analysis and structure it as "Memo 1".
        
        Respond ONLY with a valid JSON object containing the following keys. Do not include any other text, explanations, or markdown formatting.
        If a specific piece of information is not found, return a relevant empty value (e.g., an empty string "" or an empty list []).

        JSON Schema:
        - "title": The company name or title of the pitch.
        - "founder_name": The name of the founder(s) building the startup (extract from the document).
        - "founder_linkedin_url": The LinkedIn URL of the founder(s) if mentioned in the document (extract the full URL).
        - "company_linkedin_url": The LinkedIn company page URL if mentioned in the document (extract the full URL in format: https://www.linkedin.com/company/company-name/).
        - "problem": A concise summary of the core problem the company is trying to solve.
        - "solution": A concise summary of the proposed solution.
        - "traction": A summary of any key traction metrics or milestones mentioned (e.g., revenue, user numbers, key customers).
        - "market_size": The Total Addressable Market (TAM) or overall market size mentioned.
        - "business_model": A brief explanation of how the company plans to make money.
        - "competition": A list of key competitors mentioned, as an array of strings.
        - "team": A brief summary of the founding team's background or strengths.
        - "initial_flags": A list of 1-2 potential red flags or areas of concern based ONLY on the provided text.
        - "validation_points": A list of the top 2-3 most important claims from the text that an investor must validate.
        - "summary_analysis": A comprehensive 2-3 paragraph analysis that synthesizes the key findings, highlights the most compelling aspects of the opportunity, and provides an initial investment thesis with both strengths and potential concerns.
        """
        
        response = self.gemini_model.generate_content([prompt, pdf_part])
        self.logger.info("PDF processing and memo generation complete.")
        return self._parse_json_from_text(response.text)

    def _process_media(self, file_data: bytes, file_type: str) -> str:
        """Transcribes video or audio file's audio track using Speech-to-Text."""
        self.logger.info(f"Transcribing {file_type} using Speech-to-Text...")
        model = "long" if file_type == 'video' else "telephony"
        
        config = speech.RecognitionConfig(
            auto_decoding_config=speech.AutoDetectDecodingConfig(),
            language_codes=["en-US", "en-GB"],  # Added GB for broader coverage
            model=model
        )
        request = speech.RecognizeRequest(config=config, content=file_data, recognizer=f"projects/{self.project}/locations/global/recognizers/_")
        
        try:
            response = self.speech_client.recognize(request=request)
            transcript = " ".join([result.alternatives[0].transcript for result in response.results if result.alternatives])
            self.logger.info(f"{file_type.capitalize()} transcription complete. Length: {len(transcript)} chars.")
            return transcript
        except Exception as e:
            self.logger.error(f"Speech-to-Text recognition failed: {e}")
            raise  # Re-raise the exception to be caught by the main run method

    def _generate_memo_from_text(self, text: str, context: str) -> Dict[str, Any]:
        """Uses Gemini to analyze text from a transcript and generate Memo 1."""
        if not text.strip():
            self.logger.warning("No text to analyze. Skipping memo generation.")
            return {}

        self.logger.info(f"Generating Memo 1 from {context} text...")
        prompt = f"""
        You are an AI Venture Capital Analyst. Analyze the following text extracted from a startup's {context}.
        Your task is to perform an initial summary and analysis and structure it as "Memo 1".
        
        Respond ONLY with a valid JSON object containing the following keys. Do not include any other text, explanations, or markdown formatting.
        If a specific piece of information is not found, return a relevant empty value (e.g., an empty string "" or an empty list []).

        JSON Schema:
        - "title": The company name or title of the pitch.
        - "founder_name": The name of the founder(s) building the startup (extract from the text).
        - "founder_linkedin_url": The LinkedIn URL of the founder(s) if mentioned in the text (extract the full URL).
        - "company_linkedin_url": The LinkedIn company page URL if mentioned in the text (extract the full URL in format: https://www.linkedin.com/company/company-name/).
        - "problem": A concise summary of the core problem the company is trying to solve.
        - "solution": A concise summary of the proposed solution.
        - "traction": A summary of any key traction metrics or milestones mentioned (e.g., revenue, user numbers, key customers).
        - "market_size": The Total Addressable Market (TAM) or overall market size mentioned.
        - "business_model": A brief explanation of how the company plans to make money.
        - "competition": A list of key competitors mentioned, as an array of strings.
        - "team": A brief summary of the founding team's background or strengths.
        - "initial_flags": A list of 1-2 potential red flags or areas of concern based ONLY on the provided text.
        - "validation_points": A list of the top 2-3 most important claims from the text that an investor must validate.
        - "summary_analysis": A comprehensive 2-3 paragraph analysis that synthesizes the key findings, highlights the most compelling aspects of the opportunity, and provides an initial investment thesis with both strengths and potential concerns.
        
        Text to analyze:
        {text[:20000]}
        """
        response = self.gemini_model.generate_content(prompt)
        self.logger.info("Memo 1 generation from text complete.")
        return self._parse_json_from_text(response.text)
        
    def _parse_json_from_text(self, text: str) -> Dict[str, Any]:
        """Safely extracts a JSON object from a string, even with markdown wrappers."""
        self.logger.debug(f"Attempting to parse JSON from model response: {text}")
        # Use a regex to find the JSON block, which is more robust
        match = re.search(r'```(json)?\s*(\{.*?\})\s*```', text, re.DOTALL)
        if match:
            json_str = match.group(2)
        else:
            # Fallback for plain JSON without markdown
            json_str = text
            
        try:
            return json.loads(json_str)
        except json.JSONDecodeError:
            self.logger.error(f"Failed to decode JSON from model response: {json_str}")
            return {"error": "Failed to parse valid JSON from model response.", "raw_response": text}


def test_agent(file_path: str, project_id: str):
    """
    Test function to run the agent with a local file.
    
    Args:
        file_path (str): The local path to the file to process.
        project_id (str): Your Google Cloud project ID.
    """
    if not project_id:
        print("ERROR: Please provide a Google Cloud project ID.")
        return
        
    agent = IntakeCurationAgent(project=project_id)
    agent.set_up()
    
    try:
        with open(file_path, 'rb') as f:
            file_data = f.read()
            
        filename = file_path.split('/')[-1].split('\\')[-1] # Works for both / and \
        file_ext = filename.split('.')[-1].lower()
        
        if file_ext not in ['pdf', 'mp4', 'mov', 'mp3', 'wav', 'flac']:
            print(f"Unsupported file extension: {file_ext}")
            return
            
        file_type_map = {
            'pdf': 'pdf',
            'mp4': 'video', 'mov': 'video',
            'mp3': 'audio', 'wav': 'audio', 'flac': 'audio'
        }
        file_type = file_type_map[file_ext]
        
        result = agent.run(file_data=file_data, filename=filename, file_type=file_type)
        
        print("\n--- Agent Result ---")
        print(json.dumps(result, indent=2))
        print("--------------------\n")

    except FileNotFoundError:
        print(f"Error: The file was not found at {file_path}")
    except Exception as e:
        print(f"An unexpected error occurred during the test run: {e}")


if __name__ == "__main__":
    # === HOW TO RUN THIS TEST ===
    # 1. Make sure you have authenticated with Google Cloud:
    #    gcloud auth application-default login
    # 2. Set your Project ID below.
    # 3. Set the path to your test file (PDF, MP4, MP3, etc.).
    # 4. Run from your terminal: python your_script_name.py
    
    # --- Configuration ---
    # Since I remember it, I'll use your project ID.
    GCP_PROJECT_ID = "veritas-472301" 
    
    # --- Provide the path to a local file for testing ---
    # Example: TEST_FILE_PATH = "path/to/your/pitch_deck.pdf"
    # Example: TEST_FILE_PATH = "path/to/your/founder_pitch.mp4"
    TEST_FILE_PATH = "D:/startup_files/pitch_deck_v2.pdf" # <--- CHANGE THIS
    
    import os
    if not os.path.exists(TEST_FILE_PATH):
        print("="*50)
        print(f"WARNING: The test file path is a placeholder.")
        print(f"Please edit the 'TEST_FILE_PATH' variable in this script to point to a real file.")
        print(f"Current placeholder path: '{TEST_FILE_PATH}'")
        print("="*50)
    else:
        test_agent(file_path=TEST_FILE_PATH, project_id=GCP_PROJECT_ID)