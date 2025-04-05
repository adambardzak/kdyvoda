import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Calendar from './Calendar';

export default function EventForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [eventId, setEventId] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          dates: selectedDates.map(date => {
            // Create a new date at midnight UTC
            const d = new Date(date);
            d.setUTCHours(0, 0, 0, 0);
            return d.toISOString();
          }),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create event');
      }

      if (!data.event?.id) {
        throw new Error('No event ID returned from server');
      }

      // Store management token in localStorage
      localStorage.setItem(`event_${data.event.id}`, data.managementToken);

      setEventId(data.event.id);
      setSuccess(true);
      
      // Clear form
      setTitle('');
      setDescription('');
      setSelectedDates([]);
      
      // Redirect to event page after 3 seconds
      setTimeout(() => {
        router.push(`/event/${data.event.id}`);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateSelect = (date: Date) => {
    // Normalize the clicked date
    const clickedDate = new Date(date);
    clickedDate.setUTCHours(0, 0, 0, 0);

    setSelectedDates(prev => {
      // Check if the date is already selected
      const exists = prev.some(d => {
        const selectedDate = new Date(d);
        selectedDate.setUTCHours(0, 0, 0, 0);
        return selectedDate.getTime() === clickedDate.getTime();
      });

      if (exists) {
        // Remove the date if it's already selected
        return prev.filter(d => {
          const selectedDate = new Date(d);
          selectedDate.setUTCHours(0, 0, 0, 0);
          return selectedDate.getTime() !== clickedDate.getTime();
        });
      }
      
      // Add the new date
      return [...prev, clickedDate];
    });
  };

  return (
    <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-lg p-4 sm:p-6">
      {success && eventId && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center mb-2">
            <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-green-700 font-medium">Event created successfully!</p>
          </div>
          <p className="text-green-600 mb-2">Share this link with your participants:</p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="text"
              readOnly
              value={`${window.location.origin}/event/${eventId}`}
              className="flex-1 p-2 bg-white border border-green-200 rounded text-sm text-slate-600"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/event/${eventId}`);
              }}
              className="px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
            >
              Copy
            </button>
          </div>
          <p className="mt-2 text-sm text-green-600">Redirecting to event page in 3 seconds...</p>
        </div>
      )}
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-900 mb-2">
            Event Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a descriptive title"
            className="w-full rounded-md border-0 px-3 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 text-base sm:text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-900 mb-2">
            Event Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide details about the event..."
            rows={4}
            className="w-full rounded-md border-0 px-3 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 text-base sm:text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-900 mb-2">
            Select Available Dates
          </label>
          <div className="rounded-lg border border-slate-200 bg-white p-3 sm:p-6">
            <Calendar
              selectedDates={selectedDates}
              onDateSelect={handleDateSelect}
              selectable={true}
            />
          </div>
          {selectedDates.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-slate-700 mb-3">Selected Dates:</h4>
              <div className="flex flex-wrap gap-2">
                {selectedDates.map((date, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-1.5 rounded-md text-sm font-medium bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/10"
                  >
                    {date.toLocaleDateString(undefined, { 
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !title || !description || selectedDates.length === 0}
          className="w-full flex justify-center rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
        >
          {isLoading ? 'Creating...' : 'Create Event'}
        </button>
      </form>
    </div>
  );
} 