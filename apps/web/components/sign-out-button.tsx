export function SignOutButton() {
  return (
    <form action="/api/auth/logout" method="post" className="contents">
      <button
        type="submit"
        className="text-foreground-subtle hover:text-foreground transition-colors text-sm"
      >
        Sign out
      </button>
    </form>
  );
}
