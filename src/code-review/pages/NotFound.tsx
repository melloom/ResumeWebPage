import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@code-review/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@code-review/components/ui/card";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route");
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted">
      <Card className="max-w-md mx-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Page Not Found
          </CardTitle>
          <CardDescription>
            The page you're looking for doesn't exist.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            Oops! The page you're looking for doesn't exist.
          </p>
          <div className="flex justify-center">
            <Button onClick={() => navigate('/code-review')} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
