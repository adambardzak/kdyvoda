"use client";

import { useState } from "react";
import EventForm from "./components/EventForm";

export default function Home() {
  const [showForm, setShowForm] = useState(false);

  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            Find the Perfect Date
          </h1>
          <p className="mt-3 text-lg text-slate-600">
            Create an event and let your participants choose their available dates
          </p>
        </div>

        {!showForm ? (
          <div className="mt-12 text-center">
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create New Event
            </button>
          </div>
        ) : (
          <div className="mt-12">
            <EventForm />
          </div>
        )}
      </div>
    </main>
  );
}
