import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

export default function OfficeOnboarding() {
    return (
        <>
            <Head title="Office Initial Onboarding" />

            <div className="flex flex-col gap-2 text-center mb-4">
                <h1 className="text-xl font-bold tracking-tight">
                    System Onboarding
                </h1>
                <p className="text-sm text-muted-foreground">
                    Create the primary Administrator account to initialize the system.
                </p>
                <div className="flex justify-center gap-2 mt-2">
                    <Badge variant="default">Role: Administrator</Badge>
                    <Badge variant="outline">Dept: Administration</Badge>
                </div>
            </div>

            <Form
                action="/onboarding"
                method="post"
                resetOnSuccess={['password', 'password_confirmation']}
                className="flex flex-col gap-4"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    name="name"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    placeholder="Admin Name"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    tabIndex={2}
                                    autoComplete="email"
                                    placeholder="admin@office.example.com"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={3}
                                    autoComplete="new-password"
                                    placeholder="Password"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">Confirm Password</Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    required
                                    tabIndex={4}
                                    autoComplete="new-password"
                                    placeholder="Confirm Password"
                                />
                                <InputError message={errors.password_confirmation} />
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 w-full"
                                tabIndex={5}
                                disabled={processing}
                                data-test="office-onboarding-button"
                            >
                                {processing && <Spinner />}
                                Complete Initial Setup
                            </Button>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}

OfficeOnboarding.layout = {
    title: 'Office Onboarding',
    description: 'Initial administrator account setup',
};
