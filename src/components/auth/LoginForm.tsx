import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Loader2, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      toast.success('Login successful!');
    } else {
      toast.error(result.error || 'Login failed');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <Card className="card-enhanced shadow-2xl border-2 border-white/50 rounded-3xl">
          <CardHeader className="text-center pb-8 pt-10">
            <div className="flex justify-center mb-8">
              <div className="p-6 gradient-primary rounded-3xl shadow-2xl hover-glow animate-float">
                <Shield className="h-16 w-16 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl sm:text-4xl font-black text-gradient-primary mb-4">
              Brigade Attendance Portal
            </CardTitle>
            <CardDescription className="text-gray-700 mt-4 text-lg font-semibold">
              Admin login to access the attendance management system
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-0 pb-10 px-8 sm:px-10">
            <form onSubmit={handleSubmit} className="space-y-8 form-enhanced">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-base font-bold text-gray-800 flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>Email Address</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-enhanced h-14 text-base font-semibold"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="password" className="text-base font-bold text-gray-800 flex items-center space-x-2">
                  <Lock className="h-4 w-4" />
                  <span>Password</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="input-enhanced h-14 text-base font-semibold pr-14"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                onClick={handleSubmit}
                className="btn-primary w-full h-14 text-lg font-bold shadow-2xl hover-lift"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <div className="glass p-4 rounded-2xl">
                <p className="text-sm text-gray-600 font-semibold">
                  🔒 Secure access to brigade management system
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};