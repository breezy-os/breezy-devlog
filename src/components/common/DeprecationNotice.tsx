import ContextBox from "./ContextBox";

export default function DeprecationNotice() {
  return (
      <ContextBox type="error">
        <p><span className="emph1">Just a heads-up:</span> In order to speed up development on Breezy, I've put these notes pages "on hold" for the time being. Everything that's already here should still be accurate, but new pages and major updates won't be pushed any time soon.</p>
      </ContextBox>
  )
}
