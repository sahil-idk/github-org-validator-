'use client'
import Image from "next/image";
import { Input } from "@/components/ui/input"; 
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useForm } from "react-hook-form"
import z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react";
import { headers } from "next/headers";

const formSchema = z.object({
  username: z.string().min(2).max(50),
})

export default function Home() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const sanitizedQuery = query.replace(/\s+/g, ''); 
      if (sanitizedQuery.length < 3) {
        setResults(null);
        setError('');
        return;
      }

      setLoading(true);
      setError('');
      try {
        const response = await fetch(`https://api.github.com/orgs/${sanitizedQuery}`, {
          headers: {
            'Authorization': 'token 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',
          }
        });

        if (!response.ok) {
          throw new Error('Organization not found');
        }

        const data = await response.json();
        setResults(data);
        setError('');
      } catch (error) {
        setResults(null);
        setError('Organization not found');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [query]);

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  })

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Github Organization Validator</FormLabel>
                <FormControl>
                  <Input 
                    {...field}
                    placeholder="shadcn" 
                    type="search" 
                    onChange={(e) => {
                      field.onChange(e);
                      setQuery(e.target.value);
                    }}
                  />
                </FormControl>
                <FormDescription>
                  This is your public display name.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">{
            !results ? 'Invalid' : 'Valid Organisation'
          }</Button>
        </form>
      </Form>
      <div className="mt-4 w-full">
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {results && (
          <div>
            <h3 className="text-lg font-bold">Organization Details</h3>
            <p><strong>Name:</strong> {results.name}</p>
            <p><strong>Description:</strong> {results.description}</p>
            <p><strong>Public Repos:</strong> {results.public_repos}</p>
            <p><strong>Followers:</strong> {results.followers}</p>
            <a href={results.html_url} target="_blank" className="text-blue-500">View on GitHub</a>
          </div>
        )}
      </div>
    </main>
  );
}
