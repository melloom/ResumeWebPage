import { useEffect } from "react";
import { Button } from "@code-review/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@code-review/components/ui/card";
import { ArrowLeft, FileText, Shield, AlertTriangle, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TermsOfService = () => {
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
              <FileText className="h-6 w-6" />
              Terms of Service
            </CardTitle>
            <CardDescription>
              Last updated: {new Date().toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing and using Code Guardian ("the Service"), you accept and agree to be bound by the terms
                and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Description of Service</h2>
              <p className="text-muted-foreground leading-relaxed">
                Code Guardian is a code analysis and review service that helps developers identify potential issues,
                security vulnerabilities, and areas for improvement in their code. The service provides automated
                analysis, code quality metrics, and actionable recommendations.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. User Responsibilities</h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>You must provide accurate and complete information when using the Service</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                <li>You must not use the Service for any illegal or unauthorized purpose</li>
                <li>You must not submit code that contains malicious content, viruses, or harmful code</li>
                <li>You agree not to attempt to reverse engineer, duplicate, or exploit any part of the Service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Privacy and Data Protection</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service,
                to understand our practices. By using the Service, you consent to the collection and use of information
                in accordance with our Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Intellectual Property</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                The Service and its original content, features, and functionality are owned by Code Guardian and are
                protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                You retain ownership of any code you submit to the Service. By submitting code, you grant us a limited,
                non-exclusive, royalty-free license to analyze and process your code for the purpose of providing the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Service Availability</h2>
              <p className="text-muted-foreground leading-relaxed">
                We strive to maintain the Service's availability, but we do not guarantee that the Service will be
                uninterrupted, timely, secure, or error-free. We reserve the right to modify, suspend, or discontinue
                the Service at any time without notice.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                In no event shall Code Guardian, its directors, employees, partners, agents, suppliers, or affiliates be
                liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation,
                loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Disclaimer of Warranties</h2>
              <p className="text-muted-foreground leading-relaxed">
                The Service is provided on an "AS IS" and "AS AVAILABLE" basis. We make no representations or warranties
                of any kind, express or implied, as to the operation of the Service or the information, content, materials,
                or products included on the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. Termination</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may terminate or suspend your access to the Service immediately, without prior notice or liability,
                for any reason, including if you breach the Terms. Upon termination, your right to use the Service will
                cease immediately.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">10. Governing Law</h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms shall be interpreted and governed by the laws of the jurisdiction in which Code Guardian
                operates, without regard to conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">11. Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify these Terms at any time. If we make material changes, we will notify you
                by email or by posting a notice on the Service prior to the effective date of the changes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">12. Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about these Terms, please contact us at:
              </p>
              <div className="flex items-center gap-2 text-muted-foreground mt-2">
                <Mail className="h-4 w-4" />
                <span>legal@codeguardian.dev</span>
              </div>
            </section>

            <div className="mt-8 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground text-center">
                By using Code Guardian, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsOfService;