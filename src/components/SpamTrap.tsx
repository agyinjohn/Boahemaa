/** Hidden fields for spam protection (see lib/spam.ts). Put inside any public form. */
export function SpamTrap({ token }: { token: string }) {
  return (
    <>
      <input type="hidden" name="formToken" value={token} />
      {/* Honeypot: hidden from people and screen readers, but bots fill it in. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Leave this empty
          <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>
    </>
  );
}
