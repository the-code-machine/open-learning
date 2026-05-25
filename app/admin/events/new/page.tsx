import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { isAdmin } from "@/lib/auth";
import { createEventAction } from "@/lib/actions";
import EventForm from "@/components/admin/EventForm";

export const dynamic = "force-dynamic";

export default async function NewEventPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  return (
    <div className="space-y-6">
      <Link
        href="/admin"
        className="inline-flex items-center text-gray-500 hover:text-brand-blue transition-colors text-sm"
      >
        <ArrowLeft size={18} className="mr-1.5" /> Dashboard
      </Link>
      <h1 className="text-3xl font-bold text-gray-900">New Event</h1>
      <EventForm action={createEventAction} />
    </div>
  );
}
