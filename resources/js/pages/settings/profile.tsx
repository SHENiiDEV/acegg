import { Form, Head, Link, usePage } from '@inertiajs/react';
import { Field, NativeSelect, SectionTitle, flag } from '@/components/casino/form-fields';
import type { Country } from '@/components/casino/form-fields';
import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Details = {
    first_name: string | null;
    last_name: string | null;
    phone_country: string;
    phone_number: string;
    date_of_birth: string | null;
    address_line: string | null;
    city: string | null;
    country: string | null;
    postcode: string | null;
};

type Props = {
    mustVerifyEmail: boolean;
    status?: string;
    countries: Country[];
    phoneCountries: Country[];
    details: Details;
};

export default function Profile({ mustVerifyEmail, status, countries, phoneCountries, details }: Props) {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Profile settings" />
            <h1 className="sr-only">Profile settings</h1>

            <div className="space-y-6">
                <Heading variant="small" title="Personal details" description="Keep these up to date — they are required for purchases." />

                <Form action="/settings/profile" method="patch" options={{ preserveScroll: true }} className="space-y-5">
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Field label="Name" htmlFor="first_name" error={errors.first_name}>
                                    <Input id="first_name" name="first_name" required defaultValue={details.first_name ?? ''} autoComplete="given-name" />
                                </Field>
                                <Field label="Surname" htmlFor="last_name" error={errors.last_name}>
                                    <Input id="last_name" name="last_name" required defaultValue={details.last_name ?? ''} autoComplete="family-name" />
                                </Field>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <Field label="Email" htmlFor="email" error={errors.email}>
                                    <Input id="email" type="email" name="email" required defaultValue={auth.user.email} autoComplete="username" />
                                </Field>
                                <Field label="Date of birth" htmlFor="dob">
                                    <Input id="dob" value={details.date_of_birth ?? '—'} readOnly disabled />
                                </Field>
                            </div>

                            {mustVerifyEmail && auth.user.email_verified_at === null && (
                                <p className="-mt-2 text-sm text-dim">
                                    Your email address is unverified.{' '}
                                    <Link href="/email/verification-notification" method="post" as="button" className="font-semibold text-lime hover:underline">
                                        Re-send the verification email.
                                    </Link>
                                    {status === 'verification-link-sent' && (
                                        <span className="mt-1 block font-medium text-lime">A new verification link has been sent.</span>
                                    )}
                                </p>
                            )}

                            <Field label="Phone number" htmlFor="phone_number" error={errors.phone_number ?? errors.phone_country}>
                                <div className="flex gap-2">
                                    <NativeSelect name="phone_country" defaultValue={details.phone_country} className="w-[124px] shrink-0" aria-label="Dial code">
                                        {phoneCountries.map((c) => (
                                            <option key={c.code} value={c.code}>
                                                {flag(c.code)} {c.dial} — {c.name}
                                            </option>
                                        ))}
                                    </NativeSelect>
                                    <Input id="phone_number" name="phone_number" type="tel" required defaultValue={details.phone_number} autoComplete="tel-national" />
                                </div>
                            </Field>

                            <SectionTitle>Address</SectionTitle>
                            <Field label="Street, house number, apartment" htmlFor="address_line" error={errors.address_line}>
                                <Input id="address_line" name="address_line" required defaultValue={details.address_line ?? ''} autoComplete="street-address" />
                            </Field>
                            <div className="grid gap-4 sm:grid-cols-3">
                                <Field label="City" htmlFor="city" error={errors.city}>
                                    <Input id="city" name="city" required defaultValue={details.city ?? ''} autoComplete="address-level2" />
                                </Field>
                                <Field label="Post code" htmlFor="postcode" error={errors.postcode}>
                                    <Input id="postcode" name="postcode" required defaultValue={details.postcode ?? ''} autoComplete="postal-code" />
                                </Field>
                                <Field label="Country" htmlFor="country" error={errors.country}>
                                    <NativeSelect id="country" name="country" required defaultValue={details.country ?? ''}>
                                        <option value="" disabled>
                                            Select country
                                        </option>
                                        {countries.map((c) => (
                                            <option key={c.code} value={c.code}>
                                                {flag(c.code)} {c.name}
                                            </option>
                                        ))}
                                    </NativeSelect>
                                </Field>
                            </div>

                            <Button disabled={processing} data-test="update-profile-button">
                                Save changes
                            </Button>
                        </>
                    )}
                </Form>
            </div>

            <DeleteUser />
        </>
    );
}
