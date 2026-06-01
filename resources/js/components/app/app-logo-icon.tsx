import type { SVGAttributes } from 'react';

import MondialIQLogo from './mondialiq-logo';

export default function AppLogoIcon(props: SVGAttributes<SVGSVGElement>) {
    return <MondialIQLogo {...props} variant="icon" />;
}
