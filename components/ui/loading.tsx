export default function LoadingScreen({ text }: { text?: string }) {
    return <div className="flex flex-col items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-4 border-primary border-t-transparent"></div>
        <p className="mt-4 text-lg">{text ? text : "Loading..."}</p>
    </div>;
}
