import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Bot } from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="mx-auto max-w-4xl space-y-8">
            <Card>
                <CardHeader>
                     <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <Bot className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <CardTitle>Intelligent Matchmaking Agent</CardTitle>
                            <CardDescription>
                                Define your investment thesis to power your personal AI Deal Scout.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-8">
                    <div className="space-y-4">
                        <h3 className="font-semibold font-headline">Industry Focus</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                'B2B SaaS', 'FinTech', 'HealthTech', 'AI/ML', 'DeepTech', 
                                'ClimateTech', 'Marketplaces', 'Developer Tools', 'Cybersecurity',
                                'Consumer Social', 'E-commerce', 'Gaming'
                            ].map(industry => (
                                <div key={industry} className="flex items-center space-x-2">
                                    <Checkbox id={industry.toLowerCase().replace(/[\s/]/g, '')} defaultChecked={['B2B SaaS', 'AI/ML', 'Developer Tools'].includes(industry)} />
                                    <Label htmlFor={industry.toLowerCase().replace(/[\s/]/g, '')} className="text-sm font-normal">{industry}</Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-semibold font-headline">Investment Stage & Size</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="stage">Preferred Stage</Label>
                                <Select defaultValue="seed">
                                    <SelectTrigger id="stage">
                                        <SelectValue placeholder="Select stage" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pre-seed">Pre-Seed</SelectItem>
                                        <SelectItem value="seed">Seed</SelectItem>
                                        <SelectItem value="series-a">Series A</SelectItem>
                                        <SelectItem value="series-b">Series B</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="check-size">Typical Check Size (USD)</Label>
                                <Select defaultValue="500k-2m">
                                    <SelectTrigger id="check-size">
                                        <SelectValue placeholder="Select check size" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="<500k">&lt; $500k</SelectItem>
                                        <SelectItem value="500k-2m">$500k - $2M</SelectItem>
                                        <SelectItem value="2m-5m">$2M - $5M</SelectItem>
                                        <SelectItem value=">5m">&gt; $5M</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                     <div className="space-y-4">
                        <h3 className="font-semibold font-headline">Geographical Focus</h3>
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                'North America', 'Europe', 'Asia', 'Latin America', 
                                'Africa', 'Oceania', 'Middle East', 'Global / Remote-first'
                            ].map(geo => (
                                <div key={geo} className="flex items-center space-x-2">
                                    <Checkbox id={geo.toLowerCase().replace(/[\s/]/g, '')} defaultChecked={['North America', 'Global / Remote-first'].includes(geo)} />
                                    <Label htmlFor={geo.toLowerCase().replace(/[\s/]/g, '')} className="text-sm font-normal">{geo}</Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-semibold font-headline">Qualitative Thesis</h3>
                        <Label htmlFor="qualitative-thesis">Describe any specific business models, founder profiles, or theses you focus on (e.g., "founders with deep technical expertise building dev tools," "high-margin marketplace businesses").</Label>
                        <Textarea id="qualitative-thesis" placeholder="Enter your qualitative thesis..." rows={4} defaultValue="Looking for technically-strong founders building API-first developer tools or infrastructure SaaS. Strong preference for businesses with early signs of organic, bottom-up adoption." />
                    </div>
                    
                    <Button>Save Thesis</Button>
                </CardContent>
            </Card>
        </div>
    )
}
