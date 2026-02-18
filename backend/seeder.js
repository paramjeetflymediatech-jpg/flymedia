const mongoose = require("mongoose");
const dotenv = require("dotenv");
const colors = require("colors");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Tenant = require("./models/Tenant");
const Project = require("./models/Project");
const Task = require("./models/Task");
const connectDB = require("./config/db");

dotenv.config();

connectDB();

const importData = async () => {
  try {
    // 1. Create Tenant
    // Check if demo tenant exists
    let tenant = await Tenant.findOne({ name: "Demo Company" });
    if (!tenant) {
      tenant = await Tenant.create({
        name: "Demo Company",
        domain: "demo.flymedia.com",
      });
      console.log("Tenant Created".green.inverse);
    } else {
      console.log("Tenant already exists".yellow.inverse);
    }

    // 2. Create Users
    // const salt = await bcrypt.genSalt(10);
    // const password = await bcrypt.hash("123456", salt);
    const password = "password123"; // Use plain text, model will hash it. Length > 6 just in case.

    const users = [
      {
        name: "Admin User",
        email: "admin@demo.com",
        password,
        role: "admin",
        tenant: tenant._id,
      },
      {
        name: "Manager Mike",
        email: "manager@demo.com",
        password,
        role: "manager",
        tenant: tenant._id,
        designation: "Project Manager",
        department: "Management",
      },
      {
        name: "Alice Designer",
        email: "alice@demo.com",
        password,
        role: "employee",
        tenant: tenant._id,
        designation: "UI/UX Designer",
        department: "Design",
        phone: "+1234567890",
        joiningDate: new Date("2023-01-15"),
      },
      {
        name: "Bob Developer",
        email: "bob@demo.com",
        password,
        role: "employee",
        tenant: tenant._id,
        designation: "Senior Frontend Dev",
        department: "Engineering",
        phone: "+1987654321",
        joiningDate: new Date("2023-02-01"),
      },
      {
        name: "Charlie QA",
        email: "charlie@demo.com",
        password,
        role: "employee",
        tenant: tenant._id,
        designation: "QA Engineer",
        department: "Quality Assurance",
        phone: "+1122334455",
        joiningDate: new Date("2023-03-10"),
      },
      {
        name: "David Backend",
        email: "david@demo.com",
        password,
        role: "employee",
        tenant: tenant._id,
        designation: "Backend Developer",
        department: "Engineering",
        phone: "+9988776655",
        joiningDate: new Date("2023-04-20"),
      },
    ];

    // Wipe existing users for this tenant to avoid duplicates?
    // Ideally we update or upsert. For now, let's just create if email doesn't exist.
    const createdUsers = [];
    for (const u of users) {
      let user = await User.findOne({ email: u.email });
      if (!user) {
        user = await User.create(u);
        console.log(`User created: ${u.name}`.green);
      } else {
        console.log(`User exists: ${u.name}`.yellow);
      }
      createdUsers.push(user);
    }

    const admin = createdUsers[0];
    const manager = createdUsers[1];
    const alice = createdUsers[2];
    const bob = createdUsers[3];
    const charlie = createdUsers[4];
    const david = createdUsers[5];

    // 3. Create Projects
    const projectsData = [
      {
        name: "Website Redesign",
        description:
          "Revamp the company website with new branding and modern tech stack.",
        status: "planned",
        startDate: new Date(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
        client: bob._id, // Internal project
        tenant: tenant._id,
        createdBy: admin._id,
      },
      {
        name: "Mobile App Launch",
        description: "Launch the MVP for iOS and Android.",
        status: "planned",
        startDate: new Date(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 2)),
        tenant: tenant._id,
        createdBy: manager._id,
        client: alice._id,
      },
      {
        name: "Marketing Campaign Q3",
        description: "Social media and email marketing driven campaign for Q3.",
        status: "planned",
        startDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 4)),
        tenant: tenant._id,
        createdBy: manager._id,
        client: charlie._id,
      },
    ];

    const createdProjects = [];
    for (const p of projectsData) {
      let proj = await Project.findOne({ name: p.name, tenant: tenant._id });
      if (!proj) {
        proj = await Project.create(p);
        console.log(`Project created: ${p.name}`.green);
      } else {
        console.log(`Project exists: ${p.name}`.yellow);
      }
      createdProjects.push(proj);
    }

    const websiteProject = createdProjects[0];
    const mobileProject = createdProjects[1];

    // 4. Create Tasks
    const tasks = [
      // Website Redesign Tasks
      {
        title: "Design Homepage Mockup",
        description: "Create high-fidelity mockup for the new homepage.",
        status: "done",
        priority: "high",
        project: websiteProject._id,
        assignedTo: alice._id,
        tenant: tenant._id,
        dueDate: new Date(new Date().setDate(new Date().getDate() - 5)), // Past due (but done)
      },
      {
        title: "Implement Header & Footer",
        description: "Convert designs to Responsive React components.",
        status: "review",
        priority: "high",
        project: websiteProject._id,
        assignedTo: bob._id,
        tenant: tenant._id,
        dueDate: new Date(new Date().setDate(new Date().getDate() - 1)), // Yesterday
      },
      {
        title: "Setup CI/CD Pipeline",
        description: "Configure GitHub Actions for automated deployment.",
        status: "in-progress",
        priority: "medium",
        project: websiteProject._id,
        assignedTo: david._id,
        tenant: tenant._id,
        dueDate: new Date(new Date().setDate(new Date().getDate() + 2)),
      },
      {
        title: "Write About Us Content",
        description: "Draft content for the team page.",
        status: "todo",
        priority: "low",
        project: websiteProject._id,
        assignedTo: admin._id,
        tenant: tenant._id,
        dueDate: new Date(new Date().setDate(new Date().getDate() + 5)),
      },
      {
        title: "Fix Mobile Navigation Bug",
        description: "Menu doesn't close on click outside.",
        status: "todo",
        priority: "high",
        project: websiteProject._id,
        assignedTo: bob._id,
        tenant: tenant._id,
        dueDate: new Date(new Date().setDate(new Date().getDate() + 1)),
      },

      // Mobile App Tasks
      {
        title: "User Authentication API",
        description: "Implement JWT auth endpoints.",
        status: "done",
        priority: "high",
        project: mobileProject._id,
        assignedTo: david._id,
        tenant: tenant._id,
        dueDate: new Date(new Date().setDate(new Date().getDate() - 10)),
      },
      {
        title: "Login Screen UI",
        description: "Build Login and Register screens in React Native.",
        status: "in-progress",
        priority: "medium",
        project: mobileProject._id,
        assignedTo: bob._id,
        tenant: tenant._id,
        dueDate: new Date(), // Today
      },
      {
        title: "Test Payment Gateway",
        description: "Verify Stripe integration in sandbox.",
        status: "todo",
        priority: "high",
        project: mobileProject._id,
        assignedTo: charlie._id,
        tenant: tenant._id,
        dueDate: new Date(new Date().setDate(new Date().getDate() + 3)),
      },
      {
        title: "App Icon Design",
        description: "Design icons for iOS and Android stores.",
        status: "review",
        priority: "low",
        project: mobileProject._id,
        assignedTo: alice._id,
        tenant: tenant._id,
        dueDate: new Date(),
      },
    ];

    for (const t of tasks) {
      // Check if task exists (simple check by title & project)
      const exists = await Task.findOne({ title: t.title, project: t.project });
      if (!exists) {
        await Task.create(t);
        console.log(`Task created: ${t.title}`.green);
      } else {
        console.log(`Task exists: ${t.title}`.yellow);
      }
    }

    console.log("Data Imported!".green.inverse);
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};

const destroyData = async () => {
  // Optional: Add destroy logic if needed
  console.log("Destroy not implemented yet".red);
  process.exit();
};

if (process.argv[2] === "-d") {
  destroyData();
} else {
  importData();
}
