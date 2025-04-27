"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, Copy, ExternalLink, ArrowLeft, Check } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"

export default function TokenGenerator() {
  const [tokenName, setTokenName] = useState("GitHub model")
  const [tokenDescription, setTokenDescription] = useState("")
  const [expiration, setExpiration] = useState("30")
  const [organization, setOrganization] = useState("")
  const [readModels, setReadModels] = useState(true)
  const [generatedUrl, setGeneratedUrl] = useState("")
  const [copied, setCopied] = useState(false)

  const generateTokenUrl = () => {
    // GitHubのトークン生成ページのベースURL
    const baseUrl = "https://github.com/settings/personal-access-tokens/new"

    // URLパラメータを構築
    const params = new URLSearchParams()

    if (tokenName) params.append("name", tokenName)
    if (tokenDescription) params.append("description", tokenDescription)
    if (expiration) params.append("expiration", expiration)

    // 組織アクセスの追加
    if (organization) {
      params.append("organization", organization)
    }

    // 最終的なURLを生成
    const url = `${baseUrl}?${params.toString()}`
    setGeneratedUrl(url)
    return url
  }

  const copyToClipboard = () => {
    if (generatedUrl) {
      navigator.clipboard.writeText(generatedUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const openTokenPage = () => {
    const url = generatedUrl || generateTokenUrl()
    window.open(url, "_blank")
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <Link href="/" className="mr-4">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">GitHub Fine-grained トークン生成</h1>
        <div className="ml-auto">
          <Button onClick={() => window.open("https://github.com/settings/personal-access-tokens/new", "_blank")}>
            <ExternalLink className="mr-2 h-4 w-4" />
            GitHubで開く
          </Button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <Alert className="mb-6 bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">重要な設定手順</AlertTitle>
          <AlertDescription className="text-amber-700">
            <p className="mb-2">GitHubのトークン生成ページでは、以下の設定を必ず行ってください：</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>
                <strong>Account permissions</strong> セクションを探します
              </li>
              <li>
                <strong>Models</strong> 項目を見つけ、ドロップダウンから <strong>Read</strong> を選択します
              </li>
              <li>この設定により、GitHub AI機能にアクセスするための適切な権限が付与されます</li>
            </ol>
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="generator">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generator">トークン設定</TabsTrigger>
            <TabsTrigger value="info">使い方</TabsTrigger>
          </TabsList>

          <TabsContent value="generator">
            <Card>
              <CardHeader>
                <CardTitle>トークン設定</CardTitle>
                <CardDescription>
                  GitHub Fine-grained Personal Access Tokenの設定を行い、生成ページへのリンクを取得します。
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="token-name">トークン名</Label>
                  <Input
                    id="token-name"
                    placeholder="トークン名を入力"
                    value={tokenName}
                    onChange={(e) => setTokenName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="token-description">説明（オプション）</Label>
                  <Textarea
                    id="token-description"
                    placeholder="トークンの説明を入力"
                    value={tokenDescription}
                    onChange={(e) => setTokenDescription(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiration">有効期限</Label>
                  <Select value={expiration} onValueChange={setExpiration}>
                    <SelectTrigger id="expiration">
                      <SelectValue placeholder="有効期限を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7日間</SelectItem>
                      <SelectItem value="30">30日間</SelectItem>
                      <SelectItem value="60">60日間</SelectItem>
                      <SelectItem value="90">90日間</SelectItem>
                      <SelectItem value="180">180日間</SelectItem>
                      <SelectItem value="365">1年間</SelectItem>
                      <SelectItem value="custom">カスタム</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organization">組織/ユーザー名（オプション）</Label>
                  <Input
                    id="organization"
                    placeholder="アクセス権を付与する組織またはユーザー名"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                  />
                </div>

                <div className="space-y-3 pt-2">
                  <Label>必要な権限</Label>

                  <div className="flex items-start space-x-2 p-3 bg-gray-50 rounded-md border border-gray-200">
                    <Check className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">モデルへの読み取りアクセス（Read access to models）</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        GitHub AI機能を使用するには、GitHubのトークン生成ページで「Account
                        permissions」セクションの「Models」に対して「Read」権限を設定する必要があります。
                      </p>
                    </div>
                  </div>
                </div>

                {generatedUrl && (
                  <div className="pt-2">
                    <Label htmlFor="generated-url">生成されたURL</Label>
                    <div className="flex mt-1.5">
                      <Input id="generated-url" value={generatedUrl} readOnly className="font-mono text-xs" />
                      <Button
                        variant="outline"
                        size="icon"
                        className="ml-2"
                        onClick={copyToClipboard}
                        title="URLをコピー"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    {copied && <p className="text-sm text-green-600 mt-1">コピーしました！</p>}
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={generateTokenUrl}>
                  URLを生成
                </Button>
                <Button onClick={openTokenPage} disabled={!tokenName}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  GitHubで開く
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="info">
            <Card>
              <CardHeader>
                <CardTitle>使い方</CardTitle>
                <CardDescription>GitHub Fine-grained Personal Access Tokenの生成方法</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Fine-grained PATとは</h3>
                  <p>
                    Fine-grained Personal Access Token（PAT）は、GitHubのAPIやサービスにアクセスするための
                    トークンで、従来のPATよりも詳細な権限設定が可能です。GitHub AI機能を使用するには、
                    このトークンが必要です。
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">トークン生成の詳細手順</h3>
                  <ol className="list-decimal list-inside space-y-2">
                    <li>「GitHubで開く」ボタンをクリックして、GitHubのトークン生成ページに移動します</li>
                    <li>GitHubにログインしていない場合は、ログインを求められます</li>
                    <li>トークン名を入力します（例：「GitHub model」）</li>
                    <li>必要に応じて説明を追加します</li>
                    <li>有効期限を選択します</li>
                    <li className="font-semibold text-amber-800">
                      「Account permissions」セクションを探し、「Models」項目を見つけます
                    </li>
                    <li className="font-semibold text-amber-800">
                      「Models」のドロップダウンから「Read」を選択します（これが最も重要な設定です）
                    </li>
                    <li>必要に応じて他の権限を設定します</li>
                    <li>「Generate token」ボタンをクリックしてトークンを生成します</li>
                    <li>生成されたトークンをコピーして安全に保管してください（トークンは一度しか表示されません）</li>
                    <li>コピーしたトークンをチャットインターフェースの「GitHub トークン」欄に貼り付けます</li>
                  </ol>
                </div>

                <div className="p-4 bg-gray-50 rounded-md border border-gray-200 mt-4">
                  <h3 className="text-lg font-medium mb-2">権限設定のチェックリスト</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start space-x-2">
                      <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>
                        <strong>Account permissions &gt; Models</strong>: Read（必須）
                      </span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-muted-foreground ml-7">
                        この権限がないと、GitHub AI機能にアクセスできません
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-2 mt-2">
                  <h3 className="text-lg font-medium">注意事項</h3>
                  <ul className="list-disc list-inside space-y-2">
                    <li>トークンは秘密情報として扱い、公開リポジトリやコードに含めないでください</li>
                    <li>必要最小限の権限のみを付与することをお勧めします</li>
                    <li>定期的にトークンを更新し、使用しなくなったトークンは削除してください</li>
                    <li>
                      このツールはGitHubのトークン生成ページへのリンクを作成するだけで、トークン自体は生成しません
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
