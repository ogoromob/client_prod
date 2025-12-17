// src/pages/LoginPage.tsx
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';

export function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-dark-900 to-dark-950 p-4">
      <Card className="w-full max-w-md" glass>
        <CardHeader>
          <CardTitle className="text-center text-2xl">Connexion</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-300">Email</label>
            <input id="email" type="email" placeholder="admin@tradingpool.pro" className="w-full bg-dark-800 border-gray-700 rounded-md p-2 text-white focus:ring-primary-500 focus:border-primary-500" />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-gray-300">Mot de passe</label>
            <input id="password" type="password" placeholder="••••••••" className="w-full bg-dark-800 border-gray-700 rounded-md p-2 text-white focus:ring-primary-500 focus:border-primary-500" />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-4">
          <Button className="w-full" size="lg">
            Se connecter
          </Button>
          <p className="text-sm text-gray-400">
            Pas encore de compte ? <Link to="#" className="text-primary-500 hover:underline">S'inscrire</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
