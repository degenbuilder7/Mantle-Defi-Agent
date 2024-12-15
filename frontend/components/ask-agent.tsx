import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

export default function AskAgent() {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    setIsLoading(true)
    setMessages(prev => [...prev, { role: 'user', content: input }])
    setInput('')

    try {
      const response = await fetch('https://api.brianknows.org/api/v0/agent/knowledge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-brian-api-key': process.env.NEXT_PUBLIC_BRIAN_API_KEY || '',
        },
        body: JSON.stringify({ prompt: input }),
      })

      if (!response.ok) throw new Error('Failed to fetch response')

      const data = await response.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.result.answer }])
    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white p-4">
      <h2 className="text-2xl font-bold mb-2">Ask Mantle Defi Agent</h2>
      <ScrollArea className="flex-grow mb-4 pr-4">
        {messages.map((message, index) => (
          <div key={index} className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <Card className={`max-w-[80%] ${message.role === 'user' ? 'bg-blue-900' : 'bg-gray-800'}`}>
              <CardContent className="p-4">
                <p className="font-semibold mb-2">{message.role === 'user' ? 'You' : '🤖  Agent'}</p>
                {message.role === 'assistant' ? (
                  <ReactMarkdown 
                    className="prose prose-invert max-w-none"
                    components={{
                      h3: ({node, ...props}) => <h3 className="text-xl font-semibold mt-4 mb-2" {...props} />,
                      p: ({node, ...props}) => <p className="mb-2" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-2" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-2" {...props} />,
                      li: ({node, ...props}) => <li className="mb-1" {...props} />,
                      a: ({node, ...props}) => <a className="text-blue-400 hover:underline" {...props} />,
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                ) : (
                  <p>{message.content}</p>
                )}
              </CardContent>
            </Card>
          </div>
        ))}
      </ScrollArea>
      <div className="mt-auto mb-6">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Agent 🤖 a question..."
            className="flex-grow bg-gray-800 text-white border-gray-700"
          />
          <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Thinking...
              </>
            ) : (
              'Ask'
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}