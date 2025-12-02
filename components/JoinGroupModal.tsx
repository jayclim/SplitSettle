"use client"

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { UserPlus, QrCode, Link, Hash, Camera } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { joinGroupAction } from '@/lib/actions/mutations';
import { useToast } from '@/hooks/useToast';

interface JoinGroupModalProps {
  onGroupJoined: () => void;
}

interface JoinFormData {
  code?: string;
  link?: string;
}

export function JoinGroupModal({ onGroupJoined }: JoinGroupModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<JoinFormData>();

  const onSubmit = async (data: JoinFormData) => {
    try {
      setLoading(true);
      console.log('Joining group:', data);
      if (data.code) {
          await joinGroupAction(data.code);
      } else {
          throw new Error("Only join by code is currently supported");
      }
      
      toast({
        title: "Success",
        description: "You have joined the group successfully",
      });
      reset();
      setOpen(false);
      onGroupJoined();
    } catch (error) {
      console.error('Error joining group:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to join group",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <UserPlus className="h-4 w-4 mr-2" />
          Join Group
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>Join a Group</DialogTitle>
        </DialogHeader>
        <p className="text-center text-sm text-muted-foreground mb-4">
          Ask the group admin for the invite code or link. It usually looks like &apos;GR-1234&apos;.
        </p>

        <Tabs defaultValue="code" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="code">Code</TabsTrigger>
            <TabsTrigger value="link">Link</TabsTrigger>
            <TabsTrigger value="qr">QR Code</TabsTrigger>
          </TabsList>

          <TabsContent value="code" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <Hash className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-base">Enter Group Code</CardTitle>
                </div>
                <CardDescription>
                  Enter the 6-digit code shared by your group admin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Group Code</Label>
                    <Input
                      id="code"
                      {...register('code', {
                        required: 'Group code is required',
                        pattern: {
                          value: /^[A-Z0-9]{6}$/,
                          message: 'Code must be 6 characters'
                        }
                      })}
                      placeholder="ABC123"
                      className="text-center text-lg tracking-widest"
                      maxLength={6}
                    />
                    {errors.code && (
                      <p className="text-sm text-red-600">{errors.code.message}</p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  >
                    {loading ? 'Joining...' : 'Join Group'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="link" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <Link className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-base">Paste Invite Link</CardTitle>
                </div>
                <CardDescription>
                  Paste the invitation link you received
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="link">Invite Link</Label>
                    <Input
                      id="link"
                      {...register('link', {
                        required: 'Invite link is required',
                        pattern: {
                          value: /^https?:\/\/.+/,
                          message: 'Please enter a valid URL'
                        }
                      })}
                      placeholder="https://splitsettle.com/join/..."
                    />
                    {errors.link && (
                      <p className="text-sm text-red-600">{errors.link.message}</p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  >
                    {loading ? 'Joining...' : 'Join Group'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="qr" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <QrCode className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-base">Scan QR Code</CardTitle>
                </div>
                <CardDescription>
                  Use your camera to scan the group&apos;s QR code
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="w-48 h-48 bg-slate-100 rounded-lg mx-auto flex items-center justify-center mb-4">
                  <Camera className="h-12 w-12 text-slate-400" />
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  QR code scanning will be available soon. For now, please use the invite code or link.
                </p>
                <Button disabled className="w-full">
                  Open Camera
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}