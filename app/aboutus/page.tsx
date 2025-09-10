"use client";

import React, { useState, useEffect } from "react";
import { useForm, ValidationError } from "@formspree/react";
import NavbarClient from "@/Components/NavbarClient";

// --- Data Arrays --- //
const teamMembers = [
  {
    name: "Dhruv Agarwal",
    imageUrl: "/images/Dhruv.jpeg",
  },
  {
    name: "Aditi Dabra",
    imageUrl: "/images/Aditi.jpeg",
  },
  {
    name: "Aditya Yadav",
    imageUrl: "/images/Aditya.jpeg",
  },
];

// --- Components --- //

const CommonRoomSection = () => {
  const images = [
    "/images/AboutUs1.jpeg",
    "/images/AboutUs2.jpeg",
    "/images/AboutUs3.jpeg",
    "/images/AboutUs4.jpeg",
    "/images/AboutUs5.jpeg",
  ];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000); // Image changes every 3 seconds
    return () => clearInterval(intervalId);
  }, [images.length]);

  return (
    <section className="container mx-auto px-6 py-16 md:py-24">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="text-gray-700">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            WE ARE THE COMMON ROOM
          </h2>
          <div className="w-20 h-1 bg-gray-800 mb-6"></div>
          <p className="mb-4 leading-relaxed">
            Life at IIT Ropar extends far beyond the lecture halls and
            libraries. It&apos;s in the spontaneous journeys, the shared
            discoveries, and the stories that shape us. We created The Common
            Room as the digital heart of our campus—a central space to bring
            these invaluable experiences together.
          </p>
          <blockquote className="border-l-4 border-gray-300 pl-4 italic my-6">
            &quot;We realized the most transformative learning often happens on
            a weekend trek or a cultural trip... The Common Room was created to
            give those memories a home.&quot;
          </blockquote>
          <p className="leading-relaxed">
            This platform is powered by you. From breathtaking landscapes to the
            vibrant energy of a city exploration, every post adds to our
            institute&apos;s collective experience.
          </p>
          <p className="mt-6 font-serif text-2xl">Team, The Common Room</p>
        </div>

        {/* --- CORRECTED IMAGE CONTAINER --- */}
        <div className="relative w-full aspect-[1/1] rounded-lg shadow-xl">
          {images.map((src, index) => (
            <img
              key={src} // Use the image source as the key
              src={src}
              alt="A rotating collection of images from student trips"
              className={`
                absolute top-0 left-0 w-full h-full object-cover rounded-lg
                transition-opacity duration-1000 ease-in-out
                ${index === currentIndex ? "opacity-100" : "opacity-0"}
              `}
              onError={(e) => {
                e.currentTarget.src =
                  "https://placehold.co/600x700/E2E8F0/4A5568?text=Image+Not+Found";
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

const ContactUsSection = () => {
  const [state, handleSubmit] = useForm("xgvlrgrd"); // <-- Replace with your Formspree Form ID

  if (state.succeeded) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">
          Thanks for your message!
        </h3>
        <p className="text-gray-600">We&apos;ll get back to you soon.</p>
      </div>
    );
  }

  return (
    <section className="bg-gray-50">
      <div className="container mx-auto px-6 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">GET IN TOUCH</h2>
          <div className="w-20 h-1 bg-gray-800 mx-auto mt-4 mb-2"></div>
          <p className="text-gray-600">
            Have questions? We&apos;d love to hear from you.
          </p>
        </div>
        {/* form + contact info grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              Send us a Message
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="name"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  className="w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  className="w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  placeholder="you@example.com"
                  required
                />
                <ValidationError
                  prefix="Email"
                  field="email"
                  errors={state.errors}
                  className="text-red-600 text-sm mt-1"
                />
              </div>
              <div className="mb-6">
                <label
                  htmlFor="message"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  className="w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  placeholder="Your message..."
                  required
                ></textarea>
                <ValidationError
                  prefix="Message"
                  field="message"
                  errors={state.errors}
                  className="text-red-600 text-sm mt-1"
                />
              </div>
              <button
                type="submit"
                disabled={state.submitting}
                className={`w-full bg-gray-800 text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors duration-300 ${
                  state.submitting ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {state.submitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
          {/* Contact info */}
          <div className="space-y-6">
            <div className="flex items-start p-6 bg-white rounded-lg shadow-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-gray-600 mr-4 mt-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Email Us</h3>
                <p className="text-gray-600">Our team is here to help.</p>
                <a
                  href="mailto:info.thecommonroom@gmail.com"
                  className="text-indigo-600 hover:underline"
                >
                  info.thecommonroom@gmail.com
                </a>
              </div>
            </div>
            <div className="flex items-start p-6 bg-white rounded-lg shadow-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-gray-600 mr-4 mt-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Call Us</h3>
                <p className="text-gray-600">Mon-Fri from 8am to 5pm.</p>
                <a
                  href="tel:9729037086"
                  className="text-indigo-600 hover:underline"
                >
                  9729037086
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// --- Main AboutUsPage Component --- //
const AboutUsPage = () => {
  return (
    <div className="bg-white text-gray-800 font-sans">
      <section className="relative h-[300px] md:h-[400px] bg-gray-900 text-white flex items-center justify-center">
        <img
          src="/images/backgroundImage.jpg"
          alt="Two people in discussion"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
          onError={(e) => {
            e.currentTarget.src =
              "https://placehold.co/1600x400/000000/FFFFFF?text=Image";
          }}
        />
        <div className="relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-bold">THE COMMON ROOM</h1>
          <p className="mt-2 text-lg">ABOUT US</p>
        </div>
      </section>

      <CommonRoomSection />

      <section className="container mx-auto px-6 py-16 md:py-24 text-center">
        <h2 className="text-3xl font-bold text-gray-900">MEET OUR TEAM</h2>
        <div className="w-20 h-1 bg-gray-800 mx-auto mt-4 mb-2"></div>
        <p className="text-gray-600 mb-12">
          The journey of a thousand miles begins with a single step.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.map((member) => (
            <div key={member.name} className="group">
              <div className="relative overflow-hidden rounded-lg aspect-square">
                <img
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                  src={member.imageUrl}
                  alt={member.name}
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://placehold.co/400x400/E2E8F0/4A5568?text=Error";
                  }}
                />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mt-4">
                {member.name}
              </h3>
            </div>
          ))}
        </div>
      </section>

      <div id="contact-us">
        <ContactUsSection />
      </div>

      <footer className="bg-gray-800 text-gray-300 py-6">
        <div className="container mx-auto flex flex-col items-center gap-4 px-4">
          <div className="flex justify-center items-center space-x-8 md:space-x-12 text-sm">
            <a
              href="/dashboard"
              className="hover:text-white transition-colors duration-200"
            >
              Home
            </a>
            <a
              href="#"
              className="hover:text-white transition-colors duration-200"
            >
              About Us
            </a>
            <a
              href="#contact-us"
              className="hover:text-white transition-colors duration-200"
            >
              Contact Us
            </a>
          </div>
          <div className="border-t border-gray-700 w-full max-w-4xl mt-4 pt-4">
            <p className="text-center text-xs text-gray-500">
              &copy; {new Date().getFullYear()} The_Common_Room. All Rights
              Reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutUsPage;
