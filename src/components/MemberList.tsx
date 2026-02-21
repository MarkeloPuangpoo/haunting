'use client';

import { useState, type FormEvent } from 'react';
import { Plus, X, User, CreditCard } from 'lucide-react';
import type { Member } from '@/lib/types';

interface MemberListProps {
    members: Member[];
    onAddMember: (name: string, promptpayId?: string) => void;
    onRemoveMember: (id: string) => void;
    editable?: boolean;
}

export default function MemberList({
    members,
    onAddMember,
    onRemoveMember,
    editable = true,
}: MemberListProps) {
    const [newName, setNewName] = useState('');
    const [newPromptPay, setNewPromptPay] = useState('');
    const [showForm, setShowForm] = useState(false);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) return;
        onAddMember(newName.trim(), newPromptPay.trim() || undefined);
        setNewName('');
        setNewPromptPay('');
        setShowForm(false);
    };

    const resetForm = () => {
        setShowForm(false);
        setNewName('');
        setNewPromptPay('');
    };

    return (
        <div>
            <div className="flex flex-col gap-2">
                {members.map((member) => (
                    <div
                        key={member.id}
                        className="flex items-center justify-between px-3.5 py-2.5 bg-surface border border-border rounded-xl transition-all duration-200"
                    >
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-accent-soft flex items-center justify-center">
                                <User size={16} className="text-accent" />
                            </div>
                            <div>
                                <div className="font-semibold text-sm">{member.name}</div>
                                {member.promptpay_id && (
                                    <div className="text-xs text-txt-tertiary flex items-center gap-1">
                                        <CreditCard size={10} />
                                        {member.promptpay_id}
                                    </div>
                                )}
                            </div>
                        </div>

                        {editable && (
                            <button className="btn-ghost p-1.5" onClick={() => onRemoveMember(member.id)}>
                                <X size={16} />
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {editable && !showForm && (
                <button
                    className="btn-secondary mt-3 w-full flex items-center justify-center gap-2"
                    onClick={() => setShowForm(true)}
                >
                    <Plus size={16} />
                    เพิ่มสมาชิก
                </button>
            )}

            {editable && showForm && (
                <form onSubmit={handleSubmit} className="mt-3 p-4 bg-surface border border-border rounded-2xl">
                    <input
                        className="input"
                        placeholder="ชื่อ"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        autoFocus
                    />
                    <input
                        className="input mt-2"
                        placeholder="เลข PromptPay (ไม่จำเป็น)"
                        value={newPromptPay}
                        onChange={(e) => setNewPromptPay(e.target.value)}
                    />
                    <div className="flex gap-2 mt-3 justify-end">
                        <button type="button" className="btn-ghost" onClick={resetForm}>
                            ยกเลิก
                        </button>
                        <button type="submit" className="btn-primary">
                            เพิ่ม
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
