from flask import Flask, request

import main

app = Flask(__name__)


@app.route("/on_file_upload", methods=["GET", "POST", "OPTIONS"])
def on_file_upload_route():
    return main.on_file_upload(request)


@app.route("/validate_memo_data", methods=["POST", "OPTIONS"])
def validate_memo_data_route():
    return main.validate_memo_data(request)


@app.route("/validate_market_size", methods=["POST", "OPTIONS"])
def validate_market_size_route():
    return main.validate_market_size(request)


@app.route("/validate_competitors", methods=["POST", "OPTIONS"])
def validate_competitors_route():
    return main.validate_competitors(request)


@app.route("/run_diligence", methods=["POST", "OPTIONS"])
def run_diligence_route():
    return main.run_diligence(request)


@app.route("/query_diligence", methods=["POST", "OPTIONS"])
def query_diligence_route():
    return main.query_diligence(request)


@app.route("/schedule_ai_interview", methods=["POST", "OPTIONS"])
def schedule_ai_interview_route():
    return main.schedule_ai_interview(request)


@app.route("/start_ai_interview", methods=["POST", "OPTIONS"])
def start_ai_interview_route():
    return main.start_ai_interview(request)


@app.route("/submit_interview_answer", methods=["POST", "OPTIONS"])
def submit_interview_answer_route():
    return main.submit_interview_answer(request)


@app.route("/ai_feedback", methods=["POST", "OPTIONS"])
def ai_feedback_route():
    return main.ai_feedback(request)


@app.route("/check_memo", methods=["GET", "OPTIONS"])
def check_memo_route():
    return main.check_memo(request)


