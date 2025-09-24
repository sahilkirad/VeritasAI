'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Eye, FileText, Link as LinkIcon, PlusCircle, Shield } from "lucide-react";

const investorList = [
    { id: 'vc1', name: 'Momentum Ventures', avatar: 'https://picsum.photos/seed/vc1/80/80' },
    { id: 'vc2', name: 'Starlight Capital', avatar: 'https://picsum.photos/seed/vc2/80/80' },
    { id: 'vc5', name: 'Horizon Ventures', avatar: 'https://picsum.photos/seed/vc5/80/80' },
];

const documents = [
    { id: 'deck', name: 'QuantumLeap_Deck_Q2.pdf', type: 'deck' },
    { id: 'model', name: 'Financial_Model_v3.xlsx', type: 'model' },
    { id: 'video', name: 'Founder_Video_Pitch.mp4', type: 'video' },
    { id: 'bios', name: 'Team_Bios.docx', type: 'doc' },
];


export default function DataRoomsPage() {

  return (
    <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Investor Rooms</CardTitle>
                    <CardDescription>Control your narrative. Create secure rooms and grant specific investors access to specific information.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-lg">First Look Room</CardTitle>
                                <CardDescription>For initial outreach. Contains high-level info.</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm">Edit</Button>
                        </CardHeader>
                         <CardContent>
                            <div className="flex items-center justify-between">
                                 <div className="flex items-center -space-x-2">
                                    <Avatar className="h-8 w-8 border-2 border-background">
                                        <AvatarImage src={investorList[0].avatar} />
                                        <AvatarFallback>MV</AvatarFallback>
                                    </Avatar>
                                    <Avatar className="h-8 w-8 border-2 border-background">
                                        <AvatarImage src={investorList[1].avatar} />
                                        <AvatarFallback>SC</AvatarFallback>
                                    </Avatar>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Eye className="h-4 w-4" />
                                    <span>2 views</span>
                                </div>
                            </div>
                            <Separator className="my-4" />
                             <div className="space-y-2">
                                <p className="text-sm font-medium">Included Documents:</p>
                                <ul className="text-sm text-muted-foreground list-disc pl-5">
                                    <li>QuantumLeap_Deck_Q2.pdf</li>
                                </ul>
                             </div>
                         </CardContent>
                    </Card>

                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-lg">Diligence Room</CardTitle>
                                <CardDescription>For investors in the diligence phase.</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm">Edit</Button>
                        </CardHeader>
                         <CardContent>
                            <div className="flex items-center justify-between">
                                 <div className="flex items-center -space-x-2">
                                    <Avatar className="h-8 w-8 border-2 border-background">
                                        <AvatarImage src={investorList[2].avatar} />
                                        <AvatarFallback>HV</AvatarFallback>
                                    </Avatar>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Eye className="h-4 w-4" />
                                    <span>5 views</span>
                                </div>
                            </div>
                             <Separator className="my-4" />
                             <div className="space-y-2">
                                <p className="text-sm font-medium">Included Documents:</p>
                                <ul className="text-sm text-muted-foreground list-disc pl-5">
                                    <li>QuantumLeap_Deck_Q2.pdf</li>
                                    <li>Financial_Model_v3.xlsx</li>
                                    <li>Founder_Video_Pitch.mp4</li>
                                </ul>
                             </div>
                         </CardContent>
                    </Card>

                    <Button variant="outline" className="w-full">
                        <PlusCircle className="mr-2 h-4 w-4"/>
                        Create New Room
                    </Button>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-1">
             <Card>
                <CardHeader>
                    <CardTitle>Create New Room</CardTitle>
                    <CardDescription>Select documents and investors for a new secure room.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="room-name">Room Name</Label>
                        <Input id="room-name" placeholder="e.g., Series A Prospects" />
                    </div>
                    <div className="space-y-3">
                        <Label>Select Documents</Label>
                        <div className="space-y-2 rounded-md border p-3">
                             {documents.map(doc => (
                                <div key={doc.id} className="flex items-center space-x-2">
                                    <Checkbox id={`doc-${doc.id}`} />
                                    <Label htmlFor={`doc-${doc.id}`} className="text-sm font-normal flex-1">{doc.name}</Label>
                                </div>
                            ))}
                        </div>
                    </div>
                     <div className="space-y-3">
                        <Label>Grant Access To</Label>
                         <div className="space-y-2 rounded-md border p-3">
                             {investorList.map(investor => (
                                <div key={investor.id} className="flex items-center space-x-2">
                                    <Checkbox id={`inv-${investor.id}`} />
                                    <Avatar className="h-6 w-6">
                                        <AvatarImage src={investor.avatar} />
                                        <AvatarFallback>{investor.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <Label htmlFor={`inv-${investor.id}`} className="text-sm font-normal flex-1">{investor.name}</Label>
                                </div>
                            ))}
                        </div>
                    </div>
                    <Button className="w-full">
                        <Shield className="mr-2 h-4 w-4"/>
                        Create Secure Room
                    </Button>
                </CardContent>
             </Card>
        </div>
    </div>
  );
}
