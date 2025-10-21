'use client';

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Settings as SettingsIcon,
  Bell,
  Shield,
  Palette,
  Globe,
  Lock,
  Mail,
  Eye,
  Save,
  Trash2,
  Key,
  Moon,
  Sun,
  Monitor,
  Volume2,
  Download,
  Upload,
  Database,
  AlertTriangle,
  ArrowLeft,
  Home,
  User
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/auth";

export default function SettingsPage() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  // User account data
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    bio: '',
    organization: '',
    job_title: '',
    location: '',
    website: '',
  });

  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    weeklyReport: true,
    marketingEmails: false,
    soundEffects: true,
    autoSave: true,
    showTips: true,
    language: 'en',
  });

  const [saving, setSaving] = useState(false);

  // Load user data when component mounts
  useEffect(() => {
    if (user) {
      setUserData({
        username: user.username || '',
        email: user.email || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        bio: user.bio || '',
        organization: user.organization || '',
        job_title: user.job_title || '',
        location: user.location || '',
        website: user.website || '',
      });
    }
  }, [user]);

  const handleUserDataChange = (field, value) => {
    setUserData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <h1 className="text-xl mb-4">Access Denied</h1>
            <p className="text-muted-foreground mb-4">Please sign in to access settings</p>
            <Button asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      const userId = user?.id || user?.sub;

      // Update user data via API
      await apiClient.put(`/api/users/${userId}`, userData);

      // TODO: Also save notification/preference settings
      console.log('Settings saved successfully');

      // Show success message (you can add a toast notification here)
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <SettingsIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold">Settings</h1>
                  <p className="text-xs text-muted-foreground">Manage your account</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/profile')}
                className="gap-2"
              >
                <User className="w-4 h-4" />
                Profile
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 ring-2 ring-blue-100 dark:ring-blue-900/50">
                  <AvatarImage src={user?.profile_image} alt={user?.username} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold text-sm">
                    {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold">{user?.username || 'User'}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
            {/* Header */}
            <div className="mb-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 dark:from-indigo-500/5 dark:via-purple-500/5 dark:to-pink-500/5 rounded-2xl"></div>
              <div className="relative p-8 rounded-2xl border border-border/50 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <SettingsIcon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-foreground mb-1">
                      Account Settings
                    </h1>
                    <p className="text-muted-foreground">
                      Manage your account preferences and settings
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Account Information */}
              <Card className="border-border bg-card/50 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Account Information
                  </CardTitle>
                  <CardDescription>Update your personal details and profile information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username *</Label>
                      <Input
                        id="username"
                        value={userData.username}
                        onChange={(e) => handleUserDataChange('username', e.target.value)}
                        placeholder="Enter username"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={userData.email}
                        onChange={(e) => handleUserDataChange('email', e.target.value)}
                        placeholder="Enter email"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First Name</Label>
                      <Input
                        id="first_name"
                        value={userData.first_name}
                        onChange={(e) => handleUserDataChange('first_name', e.target.value)}
                        placeholder="Enter first name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input
                        id="last_name"
                        value={userData.last_name}
                        onChange={(e) => handleUserDataChange('last_name', e.target.value)}
                        placeholder="Enter last name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={userData.phone}
                        onChange={(e) => handleUserDataChange('phone', e.target.value)}
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={userData.location}
                        onChange={(e) => handleUserDataChange('location', e.target.value)}
                        placeholder="City, Country"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="organization">Organization</Label>
                      <Input
                        id="organization"
                        value={userData.organization}
                        onChange={(e) => handleUserDataChange('organization', e.target.value)}
                        placeholder="School or institution name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="job_title">Job Title</Label>
                      <Input
                        id="job_title"
                        value={userData.job_title}
                        onChange={(e) => handleUserDataChange('job_title', e.target.value)}
                        placeholder="Teacher, Professor, etc."
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        type="url"
                        value={userData.website}
                        onChange={(e) => handleUserDataChange('website', e.target.value)}
                        placeholder="https://example.com"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="bio">Bio</Label>
                      <textarea
                        id="bio"
                        value={userData.bio}
                        onChange={(e) => handleUserDataChange('bio', e.target.value)}
                        placeholder="Tell us about yourself..."
                        className="w-full min-h-[100px] px-3 py-2 text-sm rounded-md border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Appearance */}
              <Card className="border-border bg-card/50 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Palette className="w-5 h-5 text-primary" />
                    Appearance
                  </CardTitle>
                  <CardDescription>Customize how the app looks on your device</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="text-base mb-3 block">Theme</Label>
                    <div className="grid grid-cols-3 gap-4">
                      <button
                        onClick={() => setTheme('light')}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          theme === 'light'
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <Sun className="w-6 h-6 mx-auto mb-2" />
                        <p className="text-sm font-medium">Light</p>
                      </button>
                      <button
                        onClick={() => setTheme('dark')}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          theme === 'dark'
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <Moon className="w-6 h-6 mx-auto mb-2" />
                        <p className="text-sm font-medium">Dark</p>
                      </button>
                      <button
                        onClick={() => setTheme('system')}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          theme === 'system'
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <Monitor className="w-6 h-6 mx-auto mb-2" />
                        <p className="text-sm font-medium">System</p>
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notifications */}
              <Card className="border-border bg-card/50 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Bell className="w-5 h-5 text-primary" />
                    Notifications
                  </CardTitle>
                  <CardDescription>Manage how you receive notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <Label htmlFor="email-notifications" className="text-base font-medium">Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive email about your account activity</p>
                      </div>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                        <Bell className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <Label htmlFor="push-notifications" className="text-base font-medium">Push Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive push notifications on your device</p>
                      </div>
                    </div>
                    <Switch
                      id="push-notifications"
                      checked={settings.pushNotifications}
                      onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                        <SettingsIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <Label htmlFor="weekly-report" className="text-base font-medium">Weekly Report</Label>
                        <p className="text-sm text-muted-foreground">Get a weekly summary of your activity</p>
                      </div>
                    </div>
                    <Switch
                      id="weekly-report"
                      checked={settings.weeklyReport}
                      onCheckedChange={(checked) => handleSettingChange('weeklyReport', checked)}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                        <Globe className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <Label htmlFor="marketing-emails" className="text-base font-medium">Marketing Emails</Label>
                        <p className="text-sm text-muted-foreground">Receive emails about new features and updates</p>
                      </div>
                    </div>
                    <Switch
                      id="marketing-emails"
                      checked={settings.marketingEmails}
                      onCheckedChange={(checked) => handleSettingChange('marketingEmails', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Preferences */}
              <Card className="border-border bg-card/50 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Eye className="w-5 h-5 text-primary" />
                    Preferences
                  </CardTitle>
                  <CardDescription>Customize your experience</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <Volume2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <Label htmlFor="sound-effects" className="text-base font-medium">Sound Effects</Label>
                        <p className="text-sm text-muted-foreground">Play sounds for notifications and actions</p>
                      </div>
                    </div>
                    <Switch
                      id="sound-effects"
                      checked={settings.soundEffects}
                      onCheckedChange={(checked) => handleSettingChange('soundEffects', checked)}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                        <Save className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <Label htmlFor="auto-save" className="text-base font-medium">Auto-save</Label>
                        <p className="text-sm text-muted-foreground">Automatically save your work</p>
                      </div>
                    </div>
                    <Switch
                      id="auto-save"
                      checked={settings.autoSave}
                      onCheckedChange={(checked) => handleSettingChange('autoSave', checked)}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                        <Eye className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <Label htmlFor="show-tips" className="text-base font-medium">Show Tips</Label>
                        <p className="text-sm text-muted-foreground">Display helpful tips and tutorials</p>
                      </div>
                    </div>
                    <Switch
                      id="show-tips"
                      checked={settings.showTips}
                      onCheckedChange={(checked) => handleSettingChange('showTips', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Security */}
              <Card className="border-border bg-card/50 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    Security
                  </CardTitle>
                  <CardDescription>Manage your account security settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start" size="lg">
                    <Key className="w-5 h-5 mr-3" />
                    Change Password
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="lg">
                    <Lock className="w-5 h-5 mr-3" />
                    Two-Factor Authentication
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="lg">
                    <Eye className="w-5 h-5 mr-3" />
                    Active Sessions
                  </Button>
                </CardContent>
              </Card>

              {/* Data & Privacy */}
              <Card className="border-border bg-card/50 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Database className="w-5 h-5 text-primary" />
                    Data & Privacy
                  </CardTitle>
                  <CardDescription>Manage your data and privacy settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start" size="lg">
                    <Download className="w-5 h-5 mr-3" />
                    Download Your Data
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="lg">
                    <Upload className="w-5 h-5 mr-3" />
                    Export Settings
                  </Button>
                  <Separator />
                  <Button variant="destructive" className="w-full justify-start" size="lg">
                    <Trash2 className="w-5 h-5 mr-3" />
                    Delete Account
                  </Button>
                </CardContent>
              </Card>

              {/* Save Button */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  size="lg"
                  disabled={saving}
                  onClick={() => {
                    if (confirm('Are you sure you want to reset all settings to defaults?')) {
                      // Reset to defaults logic
                      setUserData({
                        username: user?.username || '',
                        email: user?.email || '',
                        first_name: '',
                        last_name: '',
                        phone: '',
                        bio: '',
                        organization: '',
                        job_title: '',
                        location: '',
                        website: '',
                      });
                    }
                  }}
                >
                  Reset to Defaults
                </Button>
                <Button size="lg" onClick={handleSaveSettings} disabled={saving}>
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Save All Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
  );
}
