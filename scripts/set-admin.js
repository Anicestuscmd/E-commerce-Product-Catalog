
require("dotenv").config();

async function main() {
  const email = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase();

  if (!email || !process.env.CLERK_SECRET_KEY) {
    throw new Error(
      "Set INITIAL_ADMIN_EMAIL and CLERK_SECRET_KEY in the root .env file."
    );
  }

  const { createClerkClient } = await import("@clerk/backend");
  const clerk = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
  });

  const result = await clerk.users.getUserList({
    emailAddress: [email],
    limit: 20,
  });

  const user = result.data.find((candidate) =>
    candidate.emailAddresses.some(
      (address) => address.emailAddress.toLowerCase() === email
    )
  );

  if (!user) {
    throw new Error(
      "No Clerk account found for this email. Sign up first."
    );
  }

  await clerk.users.updateUserMetadata(user.id, {
    publicMetadata: {
      ...user.publicMetadata,
      role: "admin",
    },
  });

  console.log("Admin role assigned successfully.");
}

main().catch((error) => {
  console.error("Could not assign admin role:", error.message);
  process.exitCode = 1;
});
