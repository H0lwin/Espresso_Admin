
# ☕ Espresso Edge - Admin Panel

Welcome to the Espresso Edge Admin Panel! This powerful and intuitive interface, built with Next.js and a modern tech stack, allows you to seamlessly manage all aspects of your Espresso Edge coffee shop operations.

## ✨ Key Features

*   **Dashboard Overview**: Get a quick snapshot of your key metrics, recent activities, and top-performing items.
*   **Order Management**: View, track, and update customer orders efficiently.
*   **Menu Customization**: Easily add, edit, and manage your coffee, food, and merchandise offerings.
*   **Customer Relationship Management (CRM)**: Keep track of your customer base, view their order history, and manage accounts.
*   **Content Management System (CMS)**: Update content for your public-facing website, including the homepage, about us, contact details, privacy policy, and terms of service.
*   **Marketing Tools**: Create and manage discount codes and view newsletter subscribers.
*   **System Administration**: Manage admin user accounts, update your profile, and configure site-wide settings.
*   **Responsive Design**: Access and manage your panel on any device, thanks to a fully responsive interface.
*   **Modern & Intuitive UI**: Built with ShadCN UI components and Tailwind CSS for a clean, professional, and user-friendly experience.
*   **AI-Powered (Future-Ready)**: Integrated with Genkit for potential future AI-driven features.

## 🚀 Tech Stack

*   **Frontend**:
    *   Next.js (App Router)
    *   React
    *   TypeScript
    *   ShadCN UI
    *   Tailwind CSS
*   **AI Integration**:
    *   Genkit (Firebase)
*   **Backend**: Designed to integrate with a Django REST Framework API.
    *(See `backend_guide.txt` for detailed backend development instructions.)*

## 🛠️ Getting Started

This project is the frontend admin panel for Espresso Edge.

1.  **Prerequisites**:
    *   Node.js (v18 or later recommended)
    *   npm or yarn

2.  **Clone the repository (if you haven't already):**
    ```bash
    git clone <your-repository-url>
    cd espresso-edge-admin-panel
    ```

3.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

4.  **Set up Environment Variables:**
    *   You may need to create a `.env.local` file for environment-specific configurations (e.g., API base URL if it's different from the development server).

5.  **Run the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    The application will typically be available at `http://localhost:9002`.

6.  **Connect to the Backend:**
    *   Ensure your Django backend is running and accessible.
    *   Update the API endpoint placeholders in the frontend code (primarily in `src/app/dashboard/**/*.tsx` files) to point to your live Django API routes.
    *   Refer to `backend_guide.txt` for comprehensive instructions on setting up the Django backend to work with this admin panel.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue.

---

Manage your coffee empire with style and efficiency using the Espresso Edge Admin Panel!
