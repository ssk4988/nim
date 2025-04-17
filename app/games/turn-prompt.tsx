import { Button } from "@/components/ui/button";

export default function TurnPrompt({ firstAction, secondAction }: { firstAction: () => void, secondAction: () => void }) {
    return <div className="flex justify-center mt-4 gap-2">
        <Button variant="outline" className="w-20" onClick={firstAction}>First</Button>
        <Button variant="outline" className="w-20" onClick={secondAction}>Second</Button>
    </div>
}
