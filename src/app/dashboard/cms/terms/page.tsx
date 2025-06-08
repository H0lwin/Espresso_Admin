"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";

const initialTermsContent = `
# Terms of Service for Espresso Edge

Last Updated: ${new Date().toLocaleDateString()}

## 1. Agreement to Terms
By using our services, you agree to be bound by these Terms of Service. If you do not agree to these Terms, do not use our services.

## 2. Changes to Terms or Services
We may modify the Terms at any time, in our sole discretion. If we do so, we’ll let you know either by posting the modified Terms on the Site or through other communications.

## 3. Who May Use the Services
You may use the Services only if you are 18 years or older and capable of forming a binding contract with Espresso Edge and are not barred from using the Services under applicable law.

## 4. Privacy Policy
Please refer to our Privacy Policy for information on how we collect, use and disclose information from our users.

## 5. Content Ownership
Espresso Edge does not claim any ownership rights in any User Content that you make available through the Services. 

(More sections as needed...)
`;

export default function CmsTermsPage() {
  const [pageTitle, setPageTitle] = React.useState("Terms of Service");
  const [content, setContent] = React.useState(initialTermsContent);
  const [lastUpdated, setLastUpdated] = React.useState(new Date().toISOString().split('T')[0]);

  const handleSaveChanges = () => {
    console.log("Saving Terms of Service:", { pageTitle, content, lastUpdated });
    alert("Terms of Service saved (check console)!");
  };

  return (
    <>
      <PageHeader
        title="CMS: Terms of Service"
        description="Manage the content of your Terms of Service page."
        actions={
          <Button onClick={handleSaveChanges}>
            <Save className="mr-2 h-4 w-4" /> Save Changes
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><FileText className="mr-2 h-5 w-5" /> Content Editor</CardTitle>
          <CardDescription>
            Use the editor below to update the Terms of Service. This is a plain text editor; for rich text, integrate a library like TipTap or Quill.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="pageTitle">Page Title</Label>
                <Input id="pageTitle" value={pageTitle} onChange={(e) => setPageTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="lastUpdated">Last Updated Date</Label>
                <Input id="lastUpdated" type="date" value={lastUpdated} onChange={(e) => setLastUpdated(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="termsContent">Terms of Service Content (Markdown or HTML supported by your frontend)</Label>
            <Textarea
              id="termsContent"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={25}
              className="font-mono text-sm"
              placeholder="Enter your terms of service content here..."
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
}
