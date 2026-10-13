'use client';

import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  MessageCircle,
  Clock,
  Compass,
  Send,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { RESTAURANT_WHATSAPP_NUMBER } from '@/lib/whatsapp';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !phone.trim() || !message.trim()) {
      setError('Please fill out all required fields.');
      return;
    }

    setSubmitting(true);
    // Prepare inquiry text and forward to WhatsApp or record
    const inquiryText = `Inquiry from ${name.trim()} (${phone.trim()}):\n${message.trim()}`;
    const waUrl = `https://wa.me/${RESTAURANT_WHATSAPP_NUMBER}?text=${encodeURIComponent(inquiryText)}`;

    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      window.open(waUrl, '_blank');
    }, 600);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Page Title */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-grill-gold">
          GET IN TOUCH
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-white font-heading">
          Contact & Location
        </h1>
        <p className="text-sm text-zinc-300">
          Visit our restaurant for dine-in, order takeaway, or chat with our team on WhatsApp.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        {/* Left Column: Restaurant Location & Contact Details */}
        <div className="space-y-6">
          <div className="p-8 rounded-3xl bg-grill-card border border-grill-border space-y-6 shadow-card">
            <div>
              <h2 className="text-2xl font-black text-white font-heading">
                GRILLVI BBQ. RICE. KARAHI
              </h2>
              <p className="text-xs font-semibold text-grill-gold uppercase tracking-wider mt-1">
                Authentic Barbecue Restaurant • Baghbanpura, Lahore
              </p>
            </div>

            <div className="space-y-4 text-sm text-zinc-300 border-t border-grill-border/80 pt-5">
              {/* Address */}
              <div className="flex items-start gap-3.5">
                <MapPin className="w-5 h-5 text-grill-red flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-semibold mb-0.5">Physical Address:</strong>
                  <p className="leading-relaxed">
                    Main Grand Trunk Road, near Sunny Pan Shop, Baghbanpura, Lahore, 54920, Pakistan
                  </p>
                </div>
              </div>

              {/* Plus Code */}
              <div className="flex items-center gap-3.5">
                <Compass className="w-5 h-5 text-grill-gold flex-shrink-0" />
                <div>
                  <strong className="text-white block font-semibold">Google Maps Plus Code:</strong>
                  <span className="font-mono text-zinc-300">H9JF+8R Lahore, Pakistan</span>
                </div>
              </div>

              {/* Phone / WhatsApp */}
              <div className="flex items-center gap-3.5">
                <Phone className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <div>
                  <strong className="text-white block font-semibold">Phone & WhatsApp:</strong>
                  <a href="tel:+923141915087" className="text-grill-gold font-mono hover:underline">
                    +92 314 1915087
                  </a>
                </div>
              </div>

              {/* Timing */}
              <div className="flex items-start gap-3.5">
                <Clock className="w-5 h-5 text-grill-orange flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-semibold">Opening Hours:</strong>
                  <p>Monday – Sunday: 5:00 PM – 2:00 AM (Dine-in)</p>
                  <p className="text-xs text-zinc-400">Home Delivery: 5:00 PM – 1:30 AM</p>
                </div>
              </div>
            </div>

            {/* Direction Buttons */}
            <div className="pt-4 border-t border-grill-border/80 flex flex-wrap gap-3">
              <a
                href="https://www.google.com/maps/search/?api=1&query=Grillvi+Main+Grand+Trunk+Road+Baghbanpura+Lahore+Pakistan"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-grill-orange to-grill-red text-white text-xs font-bold shadow-orangeGlow hover:from-grill-orange-light flex items-center gap-2 transition-all"
              >
                <MapPin className="w-4 h-4" />
                <span>Get Directions (Google Maps)</span>
              </a>

              <a
                href={`https://wa.me/${RESTAURANT_WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md flex items-center gap-2 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </a>

              <a
                href="tel:+923141915087"
                className="px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold border border-zinc-700 flex items-center gap-2 transition-colors"
              >
                <Phone className="w-4 h-4 text-grill-gold" />
                <span>Click to Call</span>
              </a>
            </div>
          </div>

          {/* Embedded Google Map Frame */}
          <div className="rounded-3xl overflow-hidden border border-grill-border shadow-card bg-grill-card h-80 relative">
            <iframe
              title="GRILLVI Google Maps Location"
              src="https://maps.google.com/maps?q=Grillvi+Main+Grand+Trunk+Road+Baghbanpura+Lahore+Pakistan&t=&z=15&ie=UTF8&iwloc=&output=embed"
              className="w-full h-full border-0 filter invert contrast-125 opacity-90 hover:opacity-100 transition-opacity"
              loading="lazy"
              allowFullScreen
            />
          </div>
        </div>

        {/* Right Column: Contact Inquiry Form */}
        <div className="p-8 rounded-3xl bg-grill-card border border-grill-border space-y-6 shadow-card">
          <div className="space-y-2 pb-4 border-b border-grill-border">
            <h2 className="text-2xl font-bold text-white font-heading">
              Send an Inquiry or Feedback
            </h2>
            <p className="text-xs text-zinc-400">
              For catering queries, bulk family feast bookings, or dining feedback, send a message directly to management.
            </p>
          </div>

          {submitted && (
            <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-700 text-emerald-200 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-400" />
              <span>
                Thank you! Your message has been prepared and opened in WhatsApp for instant chef response.
              </span>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-red-950/80 border border-red-700 text-red-200 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="text-zinc-300 font-semibold block mb-1">
                Your Full Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Asad Sheikh"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-grill-dark border border-zinc-800 focus:border-grill-gold focus:outline-none text-white text-xs"
              />
            </div>

            <div>
              <label className="text-zinc-300 font-semibold block mb-1">
                Phone Number <span className="text-red-400">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="e.g. 0314 1915087"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-grill-dark border border-zinc-800 focus:border-grill-gold focus:outline-none text-white text-xs"
              />
            </div>

            <div>
              <label className="text-zinc-300 font-semibold block mb-1">
                Your Message or Catering Inquiry <span className="text-red-400">*</span>
              </label>
              <textarea
                required
                rows={5}
                placeholder="Tell us about your event date, number of guests, or dish preferences..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-grill-dark border border-zinc-800 focus:border-grill-gold focus:outline-none text-white text-xs leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-grill-orange to-grill-red hover:from-grill-orange-light text-white font-bold text-xs shadow-orangeGlow flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Sending...' : 'Send Message on WhatsApp'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
