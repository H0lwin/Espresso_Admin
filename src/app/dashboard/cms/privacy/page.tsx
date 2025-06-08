"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, FileText } from "lucide-react";

const initialPrivacyPolicyContent = `
# Privacy Policy for Espresso Edge

Last Updated: ${new Date().toLocaleDateString()}

## 1. Introduction
Welcome to Espresso Edge. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about this privacy notice, or our practices with regards to your personal information, please contact us at privacy@espressoedge.com.

## 2. Information We Collect
We collect personal information that you voluntarily provide to us when you register on the Espresso Edge, express an interest in obtaining information about us or our products and Services, when you participate in activities on the Espresso Edge or otherwise when you contact us.

The personal information that we collect depends on the context of your interactions with us and the Espresso Edge, the choices you make and the products and features you use. The personal information we collect may include the following:
- Name and Contact Data.
- Credentials.
- Payment Data.

## 3. How We Use Your Information
We use personal information collected via our Espresso Edge for a variety of business purposes described below. 
- To facilitate account creation and logon process.
- To post testimonials.
- Request feedback.
- To enable user-to-user communications.
- To manage user accounts. 
- To send administrative information to you. 
- To protect our Services. 
- To enforce our terms, conditions and policies for business purposes, to comply with legal and regulatory requirements or in connection with our contract.

(More sections as needed...)
`;


export default function CmsPrivacyPage() {
  const [pageTitle, setPageTitle] = React.useState("Privacy Policy");
  const [content, setContent] = React.useState(initialPrivacyPolicyContent);
  const [lastUpdated, setLastUpdated] = React.useState(new Date().toISOString().split('T')[0]);


  const handleSaveChanges = () => {
    console.log("Saving Privacy Policy:", { pageTitle, content, lastUpdated });
    alert("Privacy Policy saved (check console)!");
  };

  return (
    <>
      <PageHeader
        title="CMS: Privacy Policy"
        description="Manage the content of your Privacy Policy page."
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
            Use the editor below to update the Privacy Policy. This is a plain text editor; for rich text, integrate a library like TipTap or Quill.
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
            <Label htmlFor="privacyContent">Privacy Policy Content (Markdown or HTML supported by your frontend)</Label>
            <Textarea
              id="privacyContent"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={25}
              className="font-mono text-sm"
              placeholder="Enter your privacy policy content here..."
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
}
