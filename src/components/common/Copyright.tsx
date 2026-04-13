import React from 'react';

export function Copyright() {
  const currentYear = new Date().getFullYear();
  
  return (
    <div className="text-center text-xs text-muted-foreground mt-4">
      <p>Handcrafted by Shivvilon Solutions</p>
      <p>© {currentYear} SilvonX. All rights reserved.</p>
    </div>
  );
}

export function AppFooter() {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center space-y-2">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-foreground">SilvonX</h3>
            <p className="text-sm text-muted-foreground">Complete Accounting & ERP Management System</p>
          </div>
          <Copyright />
        </div>
      </div>
    </footer>
  );
}
