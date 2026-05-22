import { Link } from "react-router";
import { Button, Icon } from "@chat/ui";

interface WelcomeStepProps {
  onNext: () => void;
}

export const WelcomeStep = ({ onNext }: WelcomeStepProps) => {
  return (
    <>
      <h1 className="wh-onb-h">Wisp</h1>
      <p className="wh-onb-tag">A quiet place for the people you love.</p>
      <Button className="wh-onb-cta" onClick={onNext}>
        Get started <Icon name="arrow" size={15} />
      </Button>
      <p style={{ marginTop: 16, fontSize: 13, color: "var(--wh-text-dim)" }}>
        Already have an account?{" "}
        <Link to="/login" style={{ color: "var(--wh-text-soft)", textDecoration: "underline" }}>
          Sign in
        </Link>
      </p>
    </>
  );
};
