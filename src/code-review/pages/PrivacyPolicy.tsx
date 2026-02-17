import { useEffect } from "react";
import { Button } from "@code-review/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@code-review/components/ui/card";
import { ArrowLeft, Shield, Eye, Database, Cookie, Mail, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <Shield className="h-6 w-6" />
              Privacy Policy
            </CardTitle>
            <CardDescription>
              Last updated: {new Date().toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                Code Guardian ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains
                how we collect, use, disclose, and safeguard your information when you use our code analysis service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Information We Collect
              </h2>
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-lg">Code Content</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    When you use our service, we collect the code you submit for analysis. This code is processed
                    temporarily to generate insights and recommendations. We do not store your code permanently
                    unless you explicitly choose to save your analysis results.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Account Information</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    When you create an account, we collect your email address, name, and optionally your GitHub
                    profile information if you choose to connect your GitHub account.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Usage Data</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We automatically collect information about how you use our service, including IP address,
                    browser type, access times, and pages viewed. This helps us improve our service and troubleshoot issues.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Cookies and Tracking</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We use cookies and similar technologies to enhance your experience, remember your preferences,
                    and analyze service usage.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Database className="h-5 w-5" />
                How We Use Your Information
              </h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>To provide, maintain, and improve our code analysis service</li>
                <li>To process and analyze your submitted code</li>
                <li>To communicate with you about your account and our services</li>
                <li>To personalize your experience and save your preferences</li>
                <li>To analyze usage patterns and optimize our service performance</li>
                <li>To detect and prevent fraud, abuse, and security issues</li>
                <li>To comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Data Security
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                We implement appropriate technical and organizational measures to protect your information:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>All data transmissions are encrypted using SSL/TLS</li>
                <li>Code analysis is performed in secure, isolated environments</li>
                <li>Access to your data is restricted to authorized personnel only</li>
                <li>We regularly review and update our security practices</li>
                <li>We retain your code only as long as necessary to provide the service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Data Retention</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                We retain your information as follows:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Code Content:</strong> Temporary processing only, deleted after analysis unless saved</li>
                <li><strong>Analysis Results:</strong> Retained until you delete them or close your account</li>
                <li><strong>Account Information:</strong> Retained until you delete your account</li>
                <li><strong>Usage Logs:</strong> Retained for up to 90 days for service improvement</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Third-Party Services</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                We may use third-party services to help operate our service:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>GitHub:</strong> For authentication and repository access (with your permission)</li>
                <li><strong>Cloud Providers:</strong> For hosting and infrastructure</li>
                <li><strong>Analytics Services:</strong> To understand service usage</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                These third parties have their own privacy policies, and we are not responsible for their practices.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Cookie className="h-5 w-5" />
                Cookies
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                We use the following types of cookies:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Essential Cookies:</strong> Required for the service to function</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and choices</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how you use our service</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                You can control cookies through your browser settings, but disabling certain cookies may affect service functionality.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Your Rights</h2>
              <p className="text-muted-foreground leading-relaxed">
                Depending on your location, you may have the following rights:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Access to your personal information</li>
                <li>Correction of inaccurate information</li>
                <li>Deletion of your account and associated data</li>
                <li>Restriction of processing</li>
                <li>Data portability</li>
                <li>Objection to processing</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Children's Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our service is not intended for children under 13 years of age. We do not knowingly collect
                personal information from children. If we become aware that we have collected information
                from a child, we will take steps to delete it promptly.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">International Data Transfers</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your information may be transferred to and processed in countries other than your own.
                We ensure appropriate safeguards are in place to protect your data in accordance with
                applicable data protection laws.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Changes to This Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any material
                changes by posting the new policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contact Us
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about this Privacy Policy or want to exercise your rights,
                please contact us at:
              </p>
              <div className="flex items-center gap-2 text-muted-foreground mt-2">
                <Mail className="h-4 w-4" />
                <span>privacy@codeguardian.dev</span>
              </div>
            </section>

            <div className="mt-8 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground text-center">
                By using Code Guardian, you acknowledge that you have read and understood this Privacy Policy.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;