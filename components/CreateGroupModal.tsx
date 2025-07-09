import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Plus, Users, MapPin, Home } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { createGroup, CreateGroupData } from '@/api/groups';
import { useToast } from '@/hooks/useToast';

interface CreateGroupModalProps {
  onGroupCreated: () => void;
}

export function CreateGroupModal({ onGroupCreated }: CreateGroupModalProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<CreateGroupData>();

  const templates = [
    {
      id: 'roommates',
      title: 'Roommate Expenses',
      description: 'Perfect for shared living costs',
      icon: <Home className="h-6 w-6" />,
      defaultName: 'Roommates',
      defaultDescription: 'Shared apartment expenses'
    },
    {
      id: 'trip',
      title: 'Trip Planning',
      description: 'Great for group vacations',
      icon: <MapPin className="h-6 w-6" />,
      defaultName: 'Weekend Trip',
      defaultDescription: 'Group vacation expenses'
    },
    {
      id: 'custom',
      title: 'Custom Group',
      description: 'Create your own setup',
      icon: <Users className="h-6 w-6" />,
      defaultName: '',
      defaultDescription: ''
    }
  ];

  const handleTemplateSelect = (template: typeof templates[0]) => {
    setStep(2);
    // Pre-fill form with template data using setValue
    if (template.defaultName) {
      setValue('name', template.defaultName);
    }
    if (template.defaultDescription) {
      setValue('description', template.defaultDescription);
    }
  };

  const onSubmit = async (data: CreateGroupData) => {
    try {
      setLoading(true);
      console.log('Creating group:', data);
      await createGroup(data);
      toast({
        title: "Group created!",
        description: "Your new group is ready to use.",
      });
      setOpen(false);
      reset();
      setStep(1);
      onGroupCreated();
    } catch (error) {
      console.error('Error creating group:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create group",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setStep(1);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
          <Plus className="h-4 w-4 mr-2" />
          Create Group
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>
            {step === 1 ? 'Choose a Template' : 'Create Your Group'}
          </DialogTitle>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Get started quickly with a template or create a custom group
            </p>
            <div className="space-y-3">
              {templates.map((template) => (
                <Card
                  key={template.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleTemplateSelect(template)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                        {template.icon}
                      </div>
                      <div>
                        <CardTitle className="text-base">{template.title}</CardTitle>
                        <CardDescription className="text-sm">
                          {template.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="groupName">Group Name</Label>
              <Input
                id="groupName"
                {...register('name', { required: 'Group name is required' })}
                placeholder="Enter group name"
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="groupDescription">Description (Optional)</Label>
              <Textarea
                id="groupDescription"
                {...register('description')}
                placeholder="What's this group for?"
                rows={3}
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                {loading ? 'Creating...' : 'Create Group'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}