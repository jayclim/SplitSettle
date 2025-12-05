import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter, DialogClose } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Settings, Users, Trash2, UserMinus, Crown, Mail, Ghost } from 'lucide-react';
import { Group } from '@/api/groups';
import { createGhostMember, inviteMember, removeMember } from '@/lib/actions/groups';
import { useToast } from '@/hooks/useToast';

interface GroupSettingsModalProps {
  group: Group;
  onGroupUpdated: () => void;
}

export function GroupSettingsModal({ group, onGroupUpdated }: GroupSettingsModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [ghostName, setGhostName] = useState('');
  const [activeTab, setActiveTab] = useState("info");
  const [addMemberMode, setAddMemberMode] = useState<'email' | 'ghost'>('email');
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useUser();

  const currentUserRole = group.members.find(m => m._id === user?.id)?.role;
  const isAdmin = currentUserRole === 'admin';

  console.log('Active Tab:', activeTab);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const confirmRemoveMember = async () => {
    if (!memberToRemove) return;
    try {
      setLoading(true);
      await removeMember(group._id, memberToRemove);
      toast({
        title: "Member removed",
        description: "Member has been removed from the group.",
      });
      setMemberToRemove(null);
      onGroupUpdated();
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove member",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMakeAdmin = async (memberId: string) => {
    try {
      setLoading(true);
      // Mock API call
      console.log('Making admin:', memberId);
      toast({
        title: "Admin role granted",
        description: "Member is now an admin.",
      });
      onGroupUpdated();
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to update member role",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInviteMember = async (ghostUserId?: string) => {
    if (!inviteEmail) return;
    try {
      setLoading(true);
      await inviteMember(group._id, inviteEmail, ghostUserId);
      toast({
        title: "Invitation sent",
        description: `Invitation sent to ${inviteEmail}`,
      });
      setInviteEmail('');
      onGroupUpdated();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send invitation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddGhostMember = async () => {
    if (!ghostName) return;
    try {
      setLoading(true);
      await createGhostMember(group._id, ghostName);
      toast({
        title: "Member added",
        description: `${ghostName} has been added to the group.`,
      });
      setGhostName('');
      onGroupUpdated();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add member",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Group Settings</span>
          </DialogTitle>
        </DialogHeader>

        <div className="w-full">
          <div className="grid w-full grid-cols-4 mb-4 bg-muted p-1 rounded-md">
            {['info', 'members', 'notifications', 'advanced'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50
                  ${activeTab === tab ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted-foreground/10'}
                `}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {activeTab === 'info' && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Group Information</CardTitle>
                  <CardDescription>Update your group details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="groupName">Group Name</Label>
                    <Input id="groupName" defaultValue={group.name} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="groupDescription">Description</Label>
                    <Textarea id="groupDescription" defaultValue={group.description} rows={3} />
                  </div>
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'members' && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Manage Members</CardTitle>
                  <CardDescription>Add or remove group members</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4 p-4 border rounded-lg bg-slate-50">
                    <h4 className="font-medium flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      Add New Member
                    </h4>
                    <div className="flex space-x-2 mb-4">
                      <Button
                        variant={addMemberMode === 'email' ? 'default' : 'outline'}
                        onClick={() => setAddMemberMode('email')}
                        className="flex-1"
                        size="sm"
                      >
                        Invite by Email
                      </Button>
                      <Button
                        variant={addMemberMode === 'ghost' ? 'default' : 'outline'}
                        onClick={() => setAddMemberMode('ghost')}
                        className="flex-1"
                        size="sm"
                      >
                        Add Ghost User
                      </Button>
                    </div>
                    
                    {addMemberMode === 'email' ? (
                      <div className="space-y-3">
                        <div className="flex space-x-2">
                          <Input
                            placeholder="friend@example.com"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                          />
                          <Button onClick={() => handleInviteMember()} disabled={loading || !inviteEmail}>
                            <Mail className="h-4 w-4 mr-2" />
                            Invite
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Send an invitation email to add a registered user.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex space-x-2">
                          <Input
                            placeholder="Member Name (e.g. Bob)"
                            value={ghostName}
                            onChange={(e) => setGhostName(e.target.value)}
                          />
                          <Button onClick={handleAddGhostMember} disabled={loading || !ghostName}>
                            <Ghost className="h-4 w-4 mr-2" />
                            Add
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Add a member without an account. You can link them later.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Current Members</h4>
                  {group.members.map((member) => (
                    <div key={member._id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          {!member.isGhost && (
                            <p className="text-sm text-muted-foreground">{member.email}</p>
                          )}
                          {member.isGhost && (
                            <Badge variant="outline" className="text-xs mt-1">Ghost User</Badge>
                          )}
                        </div>
                        <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                          {member.role}
                        </Badge>
                      </div>
                      <div className="flex space-x-2">
                        {member.isGhost && (
                           <Dialog>
                             <DialogTrigger asChild>
                               <Button size="sm" variant="outline">
                                 <Mail className="h-4 w-4 mr-1" />
                                 Invite to Claim
                               </Button>
                             </DialogTrigger>
                             <DialogContent className="sm:max-w-md">
                               <DialogHeader>
                                 <DialogTitle>Invite User to Claim {member.name}</DialogTitle>
                                 <DialogDescription>
                                   Enter the email address of the person who should claim this ghost profile.
                                 </DialogDescription>
                               </DialogHeader>
                               <div className="flex items-center space-x-2">
                                 <Input
                                   placeholder="email@example.com"
                                   value={inviteEmail}
                                   onChange={(e) => setInviteEmail(e.target.value)}
                                 />
                                 <Button onClick={() => handleInviteMember(member._id)} disabled={loading || !inviteEmail}>
                                   Send Invite
                                 </Button>
                               </div>
                             </DialogContent>
                           </Dialog>
                        )}
                        {isAdmin && member.role !== 'admin' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setMemberToRemove(member._id)}
                            disabled={loading}
                            className="text-red-600 hover:text-red-700"
                          >
                            <UserMinus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>Manage your notification preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">New Expenses</p>
                      <p className="text-sm text-muted-foreground">Get notified when expenses are added</p>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Settlement Requests</p>
                      <p className="text-sm text-muted-foreground">Get notified about payment requests</p>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">New Messages</p>
                      <p className="text-sm text-muted-foreground">Get notified about group messages</p>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">Danger Zone</CardTitle>
                  <CardDescription>Irreversible actions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border rounded-lg bg-slate-50">
                    <h4 className="font-medium mb-4 flex items-center">
                      <Crown className="h-4 w-4 mr-2" />
                      Manage Roles
                    </h4>
                    <div className="space-y-3">
                      {group.members.map((member) => (
                        <div key={member._id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={member.avatar} />
                              <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">{member.name}</span>
                          </div>
                          {member.role === 'admin' ? (
                            <Badge>Admin</Badge>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMakeAdmin(member._id)}
                              disabled={loading}
                            >
                              Make Admin
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-red-800">Delete Group</p>
                          <p className="text-sm text-red-600">This action cannot be undone</p>
                        </div>
                        <Button variant="destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Group
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </DialogContent>

      <Dialog open={!!memberToRemove} onOpenChange={(open) => !open && setMemberToRemove(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center">
              <Trash2 className="h-5 w-5 mr-2" />
              Remove Member
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this member? They will be removed from the group, but their expense history will be preserved as "Removed User".
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button type="button" variant="destructive" onClick={confirmRemoveMember} disabled={loading}>
              {loading ? "Removing..." : "Remove Member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}