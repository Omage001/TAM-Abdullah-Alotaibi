import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, type InsertUser } from "@shared/schema";
import { useLogin, useRegister, useUser } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { data: user } = useUser();
  const [isLogin, setIsLogin] = useState(true);
  
  const { mutate: login, isPending: isLoginPending } = useLogin();
  const { mutate: register, isPending: isRegisterPending } = useRegister();

  if (user) {
    setLocation("/");
    return null;
  }

  const form = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = (data: InsertUser) => {
    if (isLogin) {
      login(data);
    } else {
      register(data);
    }
  };

  const isPending = isLoginPending || isRegisterPending;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Left Panel - Hero/Marketing */}
      <div className="hidden md:flex flex-col justify-center items-center w-1/2 lg:w-2/3 bg-sidebar p-12 border-r border-sidebar-border relative overflow-hidden">
        {/* Abstract background decorative elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 max-w-lg text-center md:text-left">
          <div className="mb-8 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground shadow-xl shadow-primary/20">
            <CheckCircle2 size={32} />
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold font-display tracking-tight mb-6">
            Master your day with <span className="text-primary">TaskFlow</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            The beautifully designed productivity tool that helps you organize tasks, 
            stay focused, and get more done with less stress.
          </p>

          <div className="space-y-4">
            {["Organize with Priority Levels", "Track Progress visually", "Clean, Distraction-free UI"].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-lg font-medium text-foreground/80">
                <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                  <CheckCircle2 size={14} />
                </div>
                {feature}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={isLogin ? "login" : "register"}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md"
          >
            <Card className="border-none shadow-none md:border md:shadow-lg">
              <CardHeader className="space-y-1 pb-6">
                <CardTitle className="text-2xl font-bold font-display text-center">
                  {isLogin ? "Welcome back" : "Create an account"}
                </CardTitle>
                <CardDescription className="text-center">
                  {isLogin 
                    ? "Enter your credentials to access your account" 
                    : "Enter your details to get started"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="johndoe" {...field} className="bg-muted/30 h-11" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} className="bg-muted/30 h-11" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" className="w-full h-11 text-base font-semibold mt-4 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all" disabled={isPending}>
                      {isPending ? "Please wait..." : isLogin ? "Sign In" : "Sign Up"}
                      {!isPending && <ArrowRight className="ml-2 w-4 h-4" />}
                    </Button>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex flex-col gap-4 text-center text-sm pt-0">
                <div className="relative w-full">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or
                    </span>
                  </div>
                </div>
                
                <Button 
                  variant="ghost" 
                  className="w-full" 
                  onClick={() => setIsLogin(!isLogin)}
                >
                  {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
