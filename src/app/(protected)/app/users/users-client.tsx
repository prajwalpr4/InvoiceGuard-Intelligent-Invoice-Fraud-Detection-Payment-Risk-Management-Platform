'use client';

import { useState } from 'react';
import {
  Users2,
  Plus,
  Mail,
  ShieldCheck,
  CheckCircle2,
  UserCheck,
  Clock,
  UserX,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { OrganizationMember, UserRole } from '@/types/database';

interface UsersClientProps {
  initialMembers: OrganizationMember[];
}

export function UsersClient({ initialMembers }: UsersClientProps) {
  const [members, setMembers] = useState(initialMembers);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('finance');
  const [department, setDepartment] = useState('Accounts Payable');
  const [submitting, setSubmitting] = useState(false);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    setTimeout(() => {
      const newMember: OrganizationMember = {
        id: `member_${Date.now()}`,
        organization_id: 'org_enterprise_01',
        user_id: `usr_${Date.now()}`,
        role,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        profile: {
          id: `usr_${Date.now()}`,
          email,
          full_name: name,
          job_title: `${role.toUpperCase()} Specialist`,
          department,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      };

      setMembers([...members, newMember]);
      setIsInviteOpen(false);
      setName('');
      setEmail('');
      setSubmitting(false);
    }, 600);
  };

  const roleBadgeMap: Record<UserRole, { label: string; color: string }> = {
    admin: { label: 'Administrator', color: 'bg-purple-100 text-purple-700' },
    finance: { label: 'Finance Staff', color: 'bg-blue-100 text-blue-700' },
    approver: { label: 'Manager / Approver', color: 'bg-emerald-100 text-emerald-700' },
    auditor: { label: 'Compliance Auditor', color: 'bg-amber-100 text-amber-700' },
    vendor: { label: 'Vendor Portal', color: 'bg-slate-100 text-slate-700' },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            User Management & Role Governance
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Authorize employee seats, enforce separation of duties, and manage departmental assignments.
          </p>
        </div>

        <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-700 hover:bg-blue-800 text-white text-xs font-medium h-9 px-4 shadow-sm">
              <Plus className="w-4 h-4 mr-1.5" />
              Invite Team Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Invite Employee to Organization</DialogTitle>
              <DialogDescription className="text-xs">
                Assign authorized functional role in accordance with internal controls policy.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleInvite} className="space-y-4 py-2">
              <div className="space-y-1">
                <Label htmlFor="memName" className="text-xs">Full Name *</Label>
                <Input
                  id="memName"
                  required
                  placeholder="e.g. Jordan Hayes"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="memEmail" className="text-xs">Work Email *</Label>
                <Input
                  id="memEmail"
                  type="email"
                  required
                  placeholder="j.hayes@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="memRole" className="text-xs">Assigned Governance Role *</Label>
                <Select value={role} onValueChange={(v) => setRole((v as UserRole) || 'finance')}>
                  <SelectTrigger id="memRole" className="text-xs h-9">
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="finance">Finance Staff (Upload & Intake)</SelectItem>
                    <SelectItem value="approver">Manager / Approver (Review & Signoff)</SelectItem>
                    <SelectItem value="auditor">Auditor (Read-Only Compliance)</SelectItem>
                    <SelectItem value="admin">Administrator (Full System Control)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="memDept" className="text-xs">Department</Label>
                <Input
                  id="memDept"
                  placeholder="e.g. Accounts Payable"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="text-xs h-9"
                />
              </div>

              <DialogFooter className="pt-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 sm:gap-3">
                <Button variant="outline" size="sm" type="button" onClick={() => setIsInviteOpen(false)} className="h-9 px-4 text-xs font-medium border-slate-200">
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={submitting} className="bg-blue-700 hover:bg-blue-800 text-white h-9 px-4 text-xs font-medium shadow-sm">
                  {submitting ? 'Sending Invitation...' : 'Send Invitation'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Members Table */}
      <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Member Since</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-xs">
                          {member.profile?.full_name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">
                            {member.profile?.full_name}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {member.profile?.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                          roleBadgeMap[member.role]?.color || 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {roleBadgeMap[member.role]?.label || member.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {member.profile?.department || 'Executive'}
                    </td>
                    <td className="py-3 px-4">
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] uppercase">
                        {member.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{member.created_at?.split('T')[0]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
