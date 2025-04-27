"use client"

import type React from "react"

import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Send, Plus, Trash2, Key, Settings, ChevronDown } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import Link from "next/link"

// OpenAIのモデルリスト
const DEFAULT_MODELS = ["openai/gpt-4o", "openai/gpt-4-turbo", "openai/gpt-3.5-turbo"]

interface Message {
  role: "user" | "assistant" | "system"
  content: string
}

export default function Home() {
  const [token, setToken] = useState("")
  const [models, setModels] = useState<string[]>(DEFAULT_MODELS)
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODELS[0])
  const [newModel, setNewModel] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [systemPrompt, setSystemPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState("")
  const [showJson, setShowJson] = useState(false)
  const [requestJson, setRequestJson] = useState("")
  const [responseJson, setResponseJson] = useState("")
  const [isSystemPromptOpen, setIsSystemPromptOpen] = useState(false)

  const addModel = () => {
    if (newModel && !models.includes(newModel)) {
      setModels([...models, newModel])
      setNewModel("")
    }
  }

  const removeModel = (modelToRemove: string) => {
    const updatedModels = models.filter((model) => model !== modelToRemove)
    setModels(updatedModels)
    if (selectedModel === modelToRemove) {
      setSelectedModel(updatedModels[0] || "")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !token || !selectedModel) return

    // ユーザーメッセージを作成
    const userMessage = { role: "user" as const, content: input }

    // 表示用のメッセージ配列を更新
    setMessages([...messages, userMessage])
    setInput("")
    setLoading(true)

    try {
      // APIリクエスト用のメッセージ配列を作成
      const apiMessages: Message[] = []

      // システムプロンプトがある場合は追加
      if (systemPrompt.trim()) {
        apiMessages.push({ role: "system", content: systemPrompt.trim() })
      }

      // 既存のメッセージとユーザーメッセージを追加
      apiMessages.push(...messages, userMessage)

      const requestBody = {
        messages: apiMessages,
        model: selectedModel,
      }

      setRequestJson(JSON.stringify(requestBody, null, 2))

      const response = await fetch("https://models.github.ai/inference/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()
      setResponseJson(JSON.stringify(data, null, 2))

      if (data.choices && data.choices.length > 0) {
        const assistantMessage = data.choices[0].message
        setMessages([...messages, userMessage, assistantMessage])
        setResponse(assistantMessage.content)
      } else {
        console.error("予期しないレスポンス形式:", data)
      }
    } catch (error) {
      console.error("APIリクエストエラー:", error)
      setResponseJson(JSON.stringify({ error: "APIリクエストに失敗しました" }, null, 2))
    } finally {
      setLoading(false)
    }
  }

  const toggleSystemPrompt = () => {
    setIsSystemPromptOpen(!isSystemPromptOpen)
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">GitHub AI チャットインターフェース</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>設定</CardTitle>
              <CardDescription>APIトークンとモデルを設定してください</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="token">GitHub トークン</Label>
                <div className="flex space-x-2">
                  <Input
                    id="token"
                    type="password"
                    placeholder="ghp_..."
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                  />
                  <Link href="/token-generator">
                    <Button variant="outline" size="icon" title="Fine-grained トークンを生成">
                      <Key className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <p className="text-xs text-muted-foreground">
                  <Link href="/token-generator" className="text-primary hover:underline">
                    Fine-grained トークンを生成
                  </Link>
                  （モデルへの読み取りアクセス権限が必要です）
                </p>
              </div>

              <div className="space-y-2">
                <Label>現在のモデル</Label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger>
                    <SelectValue placeholder="モデルを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((model) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>モデル管理</Label>
                <div className="flex space-x-2">
                  <Input
                    placeholder="新しいモデルを追加"
                    value={newModel}
                    onChange={(e) => setNewModel(e.target.value)}
                  />
                  <Button size="icon" onClick={addModel}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mt-2 space-y-2">
                  {models.map((model) => (
                    <div key={model} className="flex justify-between items-center p-2 bg-secondary rounded-md">
                      <span className="text-sm truncate">{model}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeModel(model)}
                        disabled={models.length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="show-json" checked={showJson} onCheckedChange={setShowJson} />
                <Label htmlFor="show-json">JSONリクエスト/レスポンスを表示</Label>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Tabs defaultValue="chat">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="chat">チャット</TabsTrigger>
              <TabsTrigger value="json" disabled={!showJson}>
                JSON
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat">
              <Card>
                <CardHeader>
                  <CardTitle>チャット</CardTitle>
                  <CardDescription>GitHub AI APIを使用したチャット</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 border-b">
                    <button
                      onClick={toggleSystemPrompt}
                      className="flex items-center justify-between w-full py-2 text-sm font-medium text-left"
                    >
                      <div className="flex items-center">
                        <Settings className="h-4 w-4 mr-2" />
                        システムプロンプト
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-200 ${
                          isSystemPromptOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {isSystemPromptOpen && (
                      <div className="py-3">
                        <Textarea
                          placeholder="AIの動作を制御するシステムプロンプトを入力してください"
                          value={systemPrompt}
                          onChange={(e) => setSystemPrompt(e.target.value)}
                          className="min-h-[100px] text-sm"
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                          システムプロンプトはAIの動作を指示するために使用され、各会話の先頭に追加されます。
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="h-[400px] overflow-y-auto mb-4 space-y-4 p-4 border rounded-md">
                    {messages.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">
                        メッセージはまだありません。会話を始めましょう。
                      </div>
                    ) : (
                      messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-[80%] p-3 rounded-lg ${
                              msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                          </div>
                        </div>
                      ))
                    )}
                    {loading && (
                      <div className="flex justify-start">
                        <div className="max-w-[80%] p-3 rounded-lg bg-muted flex items-center space-x-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <p>応答を生成中...</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <form onSubmit={handleSubmit} className="w-full flex space-x-2">
                    <Input
                      placeholder="メッセージを入力..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      disabled={loading || !token || !selectedModel}
                    />
                    <Button type="submit" disabled={loading || !token || !selectedModel}>
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </form>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="json">
              <Card>
                <CardHeader>
                  <CardTitle>JSONリクエスト/レスポンス</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium mb-2">リクエスト</h3>
                      <Textarea className="font-mono h-[200px]" readOnly value={requestJson} />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-2">レスポンス</h3>
                      <Textarea className="font-mono h-[200px]" readOnly value={responseJson} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
