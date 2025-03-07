![mockupp](https://github.com/user-attachments/assets/503d9bce-7462-45cd-b2fd-bab20e6825a0)
## 📚 UAPEDIA - ALL IN ONE UNIVERSITY APP

## Introduction

This project is an All-in-One University App built for the **NEOFETCH Hackathon 2025**, addressing the problem statement of providing a centralized platform for university students to manage their academic, transportation, and campus life needs.

The app consolidates essential university services into a single digital ecosystem, enhancing student productivity, accessibility, and engagement. It includes features such as **bus tracking, class timetables, faculty contacts, event management, cafeteria pre-ordering, real-time announcements, and an emergency contact system.**


## Features

Features Implemented

✅ Authentication (Using Student ID)

- Secure login system with student ID verification.

- User profile setup and updates.

✅ University Bus Routes & Real-time Tracking

- Live tracking of university buses using Mapbox.

- View bus routes,Stoppage and schedules.

✅ Class Timetable & Faculty Contacts

- Real class schedules from Official Department Website API.

- Automatic reminders for assignments and exams Added in ToDo

- Faculty contact details for easy communication( Official Website API )

✅ Assignment & Exam Reminders (To-Do System)

- To-do list for tracking assignment deadlines and exam schedules.

- Push notifications for important deadlines.

✅ Event Listing & RSVP System

- View upcoming university events and club activities.

- RSVP and set reminders for events.

✅ Cafeteria Menu & Pre-Order System

- View daily meal options with prices, nutrition, and images.

- Pre-order meals to avoid queues.

✅ Official Notices & Announcements

- Fetches real-time university announcements from department websites via API.

✅ Emergency Contact Feature

- Quick access to department DAO, Advisor, and Admission office contact numbers.

✅ Profile Management

- Update user profile details, including preferences and notification settings.

✅ AI Chatbot

- Using Frequentry Ask Question AI Chatbot can provide details information about University.


## Features Aligns with the Problem Statement

| Hackathon Requirement   | Implemented in the App?  |
|------------|--------------|
| Cafeteria Menu & Pre-Order System  | ✅ Yes |
| University Bus Routes & Tracking   | ✅ Yes |
| Class Schedules & Faculty Contacts | ✅ Yes |
| Assignment & Exam Reminders    | ✅ Yes |
| Event & Club Management   | ✅ Yes |
| Campus Navigation & AR Map  | ❌ No (Skipped) |
| AI Chatbot   | ✅ Yes |

## Tech Stack

**Framework:** React Native (Expo)

**Backend & Database:** Firebase (Firestore - NoSQL)

**Authentication:** Firebase Authentication (Student ID based login)

**Maps & Navigation:** Mapbox for real-time bus tracking

**Push Notifications:** Firebase Cloud Messaging (FCM)

**State Management:** Zustand

**UI Design:** Nativewind v4 & Material3


## Firebase Data Structure (Example JSON)

**📌 Events Collection**

```bash {
  "events": [
    {
      "id": "event_001",
      "title": "Tech Fest 2025",
      "date": "2025-04-15",
      "time": "18:00",
      "location": "Main Auditorium",
      "description": "Annual university tech festival featuring AI & Robotics workshops.",
      "organizer": "Tech Club",
      "attendees": ["user_101", "user_102"],
    }
  ]
}
```
**📌 Cafeteria Collection**

```bash
{
  "meals": [
    {
      "id": "meal_001",
      "name": "Grilled Chicken with Rice",
      "price": 5.99,
      "calories": 550,
      "nutrition": {
        "protein": "40g",
        "carbs": "60g",
        "fat": "12g"
      },
      "availability": true
    }
  ]
}
```
**📌 Bus Schedule Collection**
```bash
{
  "routes": [
    {
      "route_id": 1,
      "route_name": "Route 1",
      "stops": [
        { "name": "Dhanmondi", "lat": 23.7509, "long": 90.3735 },
        { "name": "Jigatola", "lat": 23.7454, "long": 90.3715 },
        { "name": "New Market", "lat": 23.7336, "long": 90.3854 },
        { "name": "Azimpur", "lat": 23.7273, "long": 90.3846 },
        { "name": "Farmgate", "lat": 23.7579, "long": 90.3911 }
      ],
      "buses": [
        {
          "bus_no": "U1",
          "driver_name": "Rafiqul Islam",
          "contact_no": "+8801712345678",
          "current_location": { "lat": 23.7454, "long": 90.3715 },
          "schedule": [
            { "stop": "Dhanmondi", "time": "07:30 AM" },
            { "stop": "Jigatola", "time": "07:45 AM" },
            { "stop": "New Market", "time": "08:00 AM" },
            { "stop": "Azimpur", "time": "08:15 AM" },
            { "stop": "Farmgate", "time": "08:30 AM" }
          ],
          "campus_departure_time": "09:00 AM"
        }
      ]
    } 
```


## Installation

Install This Project by following this Guideline

```bash
  git clone https://github.com/yeakiniqra/NeoFetch-Hackathon.git
  cd NeoFetch-Hackathon
```
Open the Termninal

```bash
  npm install
```
Configure Firebase:

- Create a Firebase project and add the necessary config keys in firebaseConfig.js.

- Enable authentication (email/password or student ID-based auth) & Firestore.

Run the Project
```bash
  npx expo prebuild
```
```bash
  npx expo run:android
```
Project will be running at your Emulator. **Android API Level Must be 35**.
For more Guide please Follow : https://docs.expo.dev/

![APP mockuo](https://github.com/user-attachments/assets/377aa9d8-8837-4076-85cb-93fe80828b79)


## Future Enhancements

- Implement AI-based event recommendations for personalized suggestions.

- Integrate Campus Navigation with AR for an interactive mapping experience.

- Add Offline Mode for accessing schedules and notices without the internet.

- Improve Accessibility Features to ensure inclusivity.

- Publish to playstore that real world users can use it.


## Conclusion

This project successfully addresses the hackathon problem statement by offering a seamless, feature-rich, and efficient university management app. Future iterations will further refine its capabilities, making it a comprehensive solution for students.


## Contributors

This project is made my Team **UAP_NightOwlz** for MIC NEOFETCH HACKATHON 2025

**The Team**
- Yeakin Iqra
- Soma Das
- Sheikh Muhammad Ashik
- Nishat Tasnim

