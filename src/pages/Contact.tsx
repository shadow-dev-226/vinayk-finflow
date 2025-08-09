import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle } from 'lucide-react';

const Contact: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Contact</h1>
        <p className="text-muted-foreground">Get in touch with administrators</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Need Help?
          </CardTitle>
          <CardDescription>
            Contact our administrators for any queries or assistance
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-lg">
            For any features or other queries, contact admins.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Contact;