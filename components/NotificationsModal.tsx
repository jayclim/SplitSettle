import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { Bell, DollarSign, Users, MessageCircle, X, Check } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  _id: string;
  type: 'expense' | 'settlement' | 'message' | 'group_invite';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionable?: boolean;
  groupId?: string;
  groupName?: string;
  fromUser?: {
    name: string;
    avatar?: string;
  };
}

export function NotificationsModal() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      // Mock API call
      setTimeout(() => {
        setNotifications([
          {
            _id: '1',
            type: 'expense',
            title: 'New expense added',
            message: 'Sarah added "Dinner at Italian Restaurant" for $85.50',
            timestamp: '2024-01-15T10:30:00Z',
            read: false,
            groupId: '1',
            groupName: 'Roommates',
            fromUser: { name: 'Sarah Chen', avatar: '' }
          },
          {
            _id: '2',
            type: 'settlement',
            title: 'Payment request',
            message: 'Mike requested $25.00 for last week\'s groceries',
            timestamp: '2024-01-15T09:15:00Z',
            read: false,
            actionable: true,
            groupId: '1',
            groupName: 'Roommates',
            fromUser: { name: 'Mike Rodriguez', avatar: '' }
          },
          {
            _id: '3',
            type: 'message',
            title: 'New message',
            message: 'Emma: "Thanks for covering dinner last night!"',
            timestamp: '2024-01-14T20:45:00Z',
            read: true,
            groupId: '2',
            groupName: 'Weekend Trip',
            fromUser: { name: 'Emma Thompson', avatar: '' }
          },
          {
            _id: '4',
            type: 'group_invite',
            title: 'Group invitation',
            message: 'You\'ve been invited to join "Office Lunch Group"',
            timestamp: '2024-01-14T15:30:00Z',
            read: false,
            actionable: true,
            fromUser: { name: 'Alex Johnson', avatar: '' }
          }
        ]);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      });
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (open) {
      loadNotifications();
    }
  }, [open, loadNotifications]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'expense':
        return <DollarSign className="h-4 w-4" />;
      case 'settlement':
        return <DollarSign className="h-4 w-4" />;
      case 'message':
        return <MessageCircle className="h-4 w-4" />;
      case 'group_invite':
        return <Users className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'expense':
        return 'bg-green-100 text-green-600';
      case 'settlement':
        return 'bg-blue-100 text-blue-600';
      case 'message':
        return 'bg-purple-100 text-purple-600';
      case 'group_invite':
        return 'bg-orange-100 text-orange-600';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  const handleAcceptAction = async (notificationId: string) => {
    try {
      console.log('Accepting notification action:', notificationId);
      toast({
        title: "Action completed",
        description: "Request has been accepted",
      });
      // Remove notification or mark as handled
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to complete action",
        variant: "destructive",
      });
    }
  };

  const handleDeclineAction = async (notificationId: string) => {
    try {
      console.log('Declining notification action:', notificationId);
      toast({
        title: "Action completed",
        description: "Request has been declined",
      });
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to complete action",
        variant: "destructive",
      });
    }
  };

  const markAsRead = async (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Notifications</span>
            {unreadCount > 0 && (
              <Badge variant="secondary">{unreadCount} new</Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex space-x-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Bell className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-muted-foreground">No notifications</p>
              </CardContent>
            </Card>
          ) : (
            notifications.map((notification) => (
              <Card 
                key={notification._id} 
                className={`cursor-pointer transition-colors ${
                  !notification.read ? 'bg-blue-50 border-blue-200' : 'hover:bg-slate-50'
                }`}
                onClick={() => markAsRead(notification._id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getNotificationColor(notification.type)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="font-medium text-sm">{notification.title}</p>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground mb-2">
                        {notification.message}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          {notification.groupName && (
                            <Badge variant="outline" className="text-xs">
                              {notification.groupName}
                            </Badge>
                          )}
                          <span>
                            {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                          </span>
                        </div>

                        {notification.actionable && (
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeclineAction(notification._id);
                              }}
                              className="h-6 px-2 text-xs"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAcceptAction(notification._id);
                              }}
                              className="h-6 px-2 text-xs bg-green-600 hover:bg-green-700"
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {notifications.length > 0 && (
          <div className="pt-4 border-t">
            <Button 
              variant="ghost" 
              className="w-full text-sm"
              onClick={() => {
                setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                toast({
                  title: "All notifications marked as read",
                });
              }}
            >
              Mark all as read
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}