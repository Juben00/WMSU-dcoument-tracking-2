import WmsuLogo from './WmsuLogo';

export default function AppLogo() {
    return (
        <>
            <div className="flex size-12 items-center justify-center rounded-md">
                <WmsuLogo className="size-12" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">WMSU DMTS</span>
            </div>
        </>
    );
}
