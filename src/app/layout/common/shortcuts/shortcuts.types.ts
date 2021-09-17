export interface Shortcut
{
    id: string;
    label: string;
    description?: string;
    icon: string;
    link: any;
    param?: any;
    data?: any;
    useRouter: boolean;
}
