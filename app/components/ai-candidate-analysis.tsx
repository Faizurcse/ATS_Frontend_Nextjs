"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Star,
  Target,
  Lightbulb,
  Zap,
  Award,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react"

// AI Analysis types
interface AIAnalysis {
  overallScore: number
  skillsMatch: number
  experienceMatch: number
  culturalFit: number
  verdict: "highly_recommended" | "recommended" | "consider" | "not_recommended"
  reasoning: string
  confidence: number
  strengths: string[]
  weaknesses: string[]
  analysisDate: Date
}

interface AICandidateAnalysisProps {
  candidate: any
  jobPosting: any
  onAnalysisComplete?: (analysis: AIAnalysis) => void
}

// Helper function to format date
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

// Mock AI analysis generator
const generateAIAnalysis = async (candidate: any, jobPosting: any): Promise<AIAnalysis> => {
  // Simulate AI processing
  const baseScore = Math.floor(Math.random() * 30) + 70 // 70-100 range
  const skillsMatch = Math.floor(Math.random() * 40) + 60 // 60-100 range
  const experienceMatch = Math.floor(Math.random() * 35) + 65 // 65-100 range
  const culturalFit = Math.floor(Math.random() * 30) + 70 // 70-100 range

  const overallScore = Math.round((baseScore + skillsMatch + experienceMatch + culturalFit) / 4)

  let verdict: AIAnalysis["verdict"]
  if (overallScore >= 90) verdict = "highly_recommended"
  else if (overallScore >= 80) verdict = "recommended"
  else if (overallScore >= 70) verdict = "consider"
  else verdict = "not_recommended"

  const strengths = [
    "Strong technical background with relevant experience",
    "Excellent problem-solving and analytical skills",
    "Proven track record of successful project delivery",
    "Good communication and collaboration abilities",
    "Continuous learning mindset and adaptability",
  ].slice(0, Math.floor(Math.random() * 3) + 2)

  const weaknesses = [
    "Limited experience with specific technology stack",
    "Could benefit from more leadership experience",
    "Geographic location may require remote work consideration",
    "Salary expectations may be above budget range",
  ].slice(0, Math.floor(Math.random() * 2) + 1)

  const reasoningMap = {
    highly_recommended:
      "This candidate demonstrates exceptional qualifications with strong alignment to role requirements. Technical skills are outstanding and experience level perfectly matches the position needs.",
    recommended:
      "This candidate shows solid qualifications and good fit for the role. Skills and experience align well with requirements, making them a strong contender for the position.",
    consider:
      "This candidate has potential but shows some gaps in key areas. While they meet basic requirements, additional evaluation is recommended to assess overall fit.",
    not_recommended:
      "This candidate does not meet the core requirements for this position. Significant gaps in skills or experience make them unsuitable for the current role.",
  }

  return {
    overallScore,
    skillsMatch,
    experienceMatch,
    culturalFit,
    verdict,
    reasoning: reasoningMap[verdict],
    confidence: Math.floor(Math.random() * 20) + 80, // 80-100% confidence
    strengths,
    weaknesses,
    analysisDate: new Date(),
  }
}

export default function AICandidateAnalysis({ candidate, jobPosting, onAnalysisComplete }: AICandidateAnalysisProps) {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    if (candidate && jobPosting) {
      performAIAnalysis()
    }
  }, [candidate, jobPosting])

  const performAIAnalysis = async () => {
    setIsLoading(true)
    try {
      // Simulate AI processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const aiAnalysis = await generateAIAnalysis(candidate, jobPosting)
      setAnalysis(aiAnalysis)
      onAnalysisComplete?.(aiAnalysis)
    } catch (error) {
      console.error("AI Analysis failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case "highly_recommended":
        return "text-green-600 bg-green-100 border-green-200"
      case "recommended":
        return "text-blue-600 bg-blue-100 border-blue-200"
      case "consider":
        return "text-yellow-600 bg-yellow-100 border-yellow-200"
      case "not_recommended":
        return "text-red-600 bg-red-100 border-red-200"
      default:
        return "text-gray-600 bg-gray-100 border-gray-200"
    }
  }

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case "highly_recommended":
        return <ThumbsUp className="w-5 h-5 text-green-600" />
      case "recommended":
        return <CheckCircle className="w-5 h-5 text-blue-600" />
      case "consider":
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      case "not_recommended":
        return <ThumbsDown className="w-5 h-5 text-red-600" />
      default:
        return <Brain className="w-5 h-5 text-gray-600" />
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 80) return "text-blue-600"
    if (score >= 70) return "text-yellow-600"
    if (score >= 60) return "text-orange-600"
    return "text-red-600"
  }

  const getProgressColor = (score: number) => {
    if (score >= 90) return "bg-green-600"
    if (score >= 80) return "bg-blue-600"
    if (score >= 70) return "bg-yellow-600"
    if (score >= 60) return "bg-orange-600"
    return "bg-red-600"
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-purple-600 animate-pulse" />
            <span>AI Analysis in Progress...</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-purple-600 animate-bounce" />
              <span className="text-sm text-gray-600">Analyzing candidate profile...</span>
            </div>
            <Progress value={33} className="w-full" />
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-purple-600 animate-bounce" />
              <span className="text-sm text-gray-600">Matching skills and experience...</span>
            </div>
            <Progress value={66} className="w-full" />
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4 text-purple-600 animate-bounce" />
              <span className="text-sm text-gray-600">Generating recommendations...</span>
            </div>
            <Progress value={90} className="w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!analysis) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-gray-400" />
            <span>AI Analysis Unavailable</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Unable to generate AI analysis at this time.</p>
          <Button onClick={performAIAnalysis} className="mt-4">
            <Brain className="w-4 h-4 mr-2" />
            Retry Analysis
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* AI Analysis Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="w-6 h-6 text-purple-600" />
                <span>AI-Powered Candidate Analysis</span>
              </CardTitle>
              <p className="text-gray-600 mt-1">
                Comprehensive evaluation for {candidate?.name || "Candidate"} • {jobPosting?.title || "Position"}
              </p>
            </div>
            <Badge className={`${getVerdictColor(analysis.verdict)} border`}>
              {analysis.verdict.replace("_", " ").toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`text-3xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                {analysis.overallScore}
              </div>
              <p className="text-sm text-gray-600">Overall Score</p>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold ${getScoreColor(analysis.skillsMatch)}`}>{analysis.skillsMatch}%</div>
              <p className="text-sm text-gray-600">Skills Match</p>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold ${getScoreColor(analysis.experienceMatch)}`}>
                {analysis.experienceMatch}%
              </div>
              <p className="text-sm text-gray-600">Experience</p>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold ${getScoreColor(analysis.culturalFit)}`}>{analysis.culturalFit}%</div>
              <p className="text-sm text-gray-600">Cultural Fit</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="strengths">Strengths</TabsTrigger>
          <TabsTrigger value="areas">Areas for Growth</TabsTrigger>
          <TabsTrigger value="recommendation">Recommendation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Score Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <span>Score Breakdown</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Skills Match</span>
                    <span className={`font-bold ${getScoreColor(analysis.skillsMatch)}`}>{analysis.skillsMatch}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getProgressColor(analysis.skillsMatch)}`}
                      style={{ width: `${analysis.skillsMatch}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Experience Match</span>
                    <span className={`font-bold ${getScoreColor(analysis.experienceMatch)}`}>
                      {analysis.experienceMatch}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getProgressColor(analysis.experienceMatch)}`}
                      style={{ width: `${analysis.experienceMatch}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Cultural Fit</span>
                    <span className={`font-bold ${getScoreColor(analysis.culturalFit)}`}>{analysis.culturalFit}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getProgressColor(analysis.culturalFit)}`}
                      style={{ width: `${analysis.culturalFit}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Verdict */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {getVerdictIcon(analysis.verdict)}
                  <span>AI Verdict</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`p-4 rounded-lg border ${getVerdictColor(analysis.verdict)}`}>
                  <h3 className="font-semibold text-lg mb-2">{analysis.verdict.replace("_", " ").toUpperCase()}</h3>
                  <p className="text-sm mb-3">{analysis.reasoning}</p>
                  <div className="flex items-center space-x-2 text-sm">
                    <Brain className="w-4 h-4" />
                    <span>Confidence: {analysis.confidence}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="strengths" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-green-600" />
                <span>Key Strengths</span>
              </CardTitle>
              <p className="text-sm text-gray-600">Areas where the candidate excels</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis.strengths.map((strength, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-200"
                  >
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-900">{strength}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="areas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="w-5 h-5 text-orange-600" />
                <span>Areas for Growth</span>
              </CardTitle>
              <p className="text-sm text-gray-600">Potential areas for improvement or consideration</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis.weaknesses.map((weakness, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg border border-orange-200"
                  >
                    <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-orange-900">{weakness}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-purple-600" />
                <span>AI Recommendation</span>
              </CardTitle>
              <p className="text-sm text-gray-600">Detailed analysis and next steps</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className={`p-4 rounded-lg border ${getVerdictColor(analysis.verdict)}`}>
                  <div className="flex items-center space-x-2 mb-3">
                    {getVerdictIcon(analysis.verdict)}
                    <h3 className="font-semibold text-lg">{analysis.verdict.replace("_", " ").toUpperCase()}</h3>
                  </div>
                  <p className="mb-4">{analysis.reasoning}</p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                        {analysis.overallScore}/100
                      </div>
                      <p className="text-xs text-gray-600">Overall Score</p>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(analysis.confidence)}`}>
                        {analysis.confidence}%
                      </div>
                      <p className="text-xs text-gray-600">AI Confidence</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{analysis.strengths.length}</div>
                      <p className="text-xs text-gray-600">Key Strengths</p>
                    </div>
                  </div>

                  {/* Next Steps */}
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Recommended Next Steps:</h4>
                    <ul className="space-y-1 text-sm">
                      {analysis.verdict === "highly_recommended" && (
                        <>
                          <li>• Schedule technical interview immediately</li>
                          <li>• Prepare competitive offer package</li>
                          <li>• Fast-track through interview process</li>
                        </>
                      )}
                      {analysis.verdict === "recommended" && (
                        <>
                          <li>• Proceed with standard interview process</li>
                          <li>• Conduct thorough skills assessment</li>
                          <li>• Check references for cultural fit</li>
                        </>
                      )}
                      {analysis.verdict === "consider" && (
                        <>
                          <li>• Additional screening interview recommended</li>
                          <li>• Skills gap assessment needed</li>
                          <li>• Consider for future opportunities</li>
                        </>
                      )}
                      {analysis.verdict === "not_recommended" && (
                        <>
                          <li>• Politely decline application</li>
                          <li>• Keep profile for future suitable roles</li>
                          <li>• Provide constructive feedback if requested</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Analysis Metadata */}
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <span>Analysis Date: {formatDate(analysis.analysisDate)}</span>
              <span>•</span>
              <span>AI Model: GPT-4 Enhanced</span>
              <span>•</span>
              <span>Processing Time: 1.8s</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={performAIAnalysis}
              className="text-purple-600 border-purple-200 hover:bg-purple-50 bg-transparent"
            >
              <Brain className="w-4 h-4 mr-2" />
              Re-analyze
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
