import { Form, Head } from '@inertiajs/react';
import { useState } from 'react';
import { Field, NativeSelect, SectionTitle, flag } from '@/components/casino/form-fields';
import type { Country } from '@/components/casino/form-fields';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';

type Props = {
    passwordRules: string;
    countries: Country[];
    phoneCountries: Country[];
    maxBirthDate: string;
};

export default function Register({ passwordRules, countries, phoneCountries, maxBirthDate }: Props) {
    const [country, setCountry] = useState('');
    const [phoneCountry, setPhoneCountry] = useState('GB');

    return (
        <>
            <Head title="Register" />
            <Form
                action="/register"
                method="post"
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-5"
            >
                {({ processing, errors }) => (
                    <>
                        <SectionTitle>Account</SectionTitle>
                        <Field label="Email" htmlFor="email" error={errors.email}>
                            <Input id="email" type="email" name="email" required autoFocus autoComplete="email" placeholder="email@example.com" />
                        </Field>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="Password" htmlFor="password" error={errors.password}>
                                <PasswordInput id="password" name="password" required autoComplete="new-password" placeholder="Password" passwordrules={passwordRules} />
                            </Field>
                            <Field label="Confirm password" htmlFor="password_confirmation" error={errors.password_confirmation}>
                                <PasswordInput
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    required
                                    autoComplete="new-password"
                                    placeholder="Repeat password"
                                    passwordrules={passwordRules}
                                />
                            </Field>
                        </div>

                        <SectionTitle>Personal details</SectionTitle>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="Name" htmlFor="first_name" error={errors.first_name}>
                                <Input id="first_name" name="first_name" required autoComplete="given-name" placeholder="John" />
                            </Field>
                            <Field label="Surname" htmlFor="last_name" error={errors.last_name}>
                                <Input id="last_name" name="last_name" required autoComplete="family-name" placeholder="Smith" />
                            </Field>
                        </div>
                        <Field label="Phone number" htmlFor="phone_number" error={errors.phone_number ?? errors.phone_country}>
                            <div className="flex gap-2">
                                <NativeSelect
                                    name="phone_country"
                                    value={phoneCountry}
                                    onChange={(e) => setPhoneCountry(e.target.value)}
                                    className="w-[124px] shrink-0"
                                    aria-label="Dial code"
                                >
                                    {phoneCountries.map((c) => (
                                        <option key={c.code} value={c.code}>
                                            {flag(c.code)} {c.dial} — {c.name}
                                        </option>
                                    ))}
                                </NativeSelect>
                                <Input id="phone_number" name="phone_number" type="tel" inputMode="tel" required autoComplete="tel-national" placeholder="20 123 456" />
                            </div>
                        </Field>
                        <Field label="Date of birth" htmlFor="date_of_birth" error={errors.date_of_birth}>
                            <Input id="date_of_birth" name="date_of_birth" type="date" required max={maxBirthDate} min="1900-01-01" autoComplete="bday" className="[color-scheme:dark]" />
                        </Field>

                        <SectionTitle>Address</SectionTitle>
                        <Field label="Street, house number, apartment" htmlFor="address_line" error={errors.address_line}>
                            <Input id="address_line" name="address_line" required autoComplete="street-address" placeholder="Brīvības iela 1, apt. 5" />
                        </Field>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="City" htmlFor="city" error={errors.city}>
                                <Input id="city" name="city" required autoComplete="address-level2" placeholder="Riga" />
                            </Field>
                            <Field label="Post code" htmlFor="postcode" error={errors.postcode}>
                                <Input id="postcode" name="postcode" required autoComplete="postal-code" placeholder="LV-1010" />
                            </Field>
                        </div>
                        <Field label="Country" htmlFor="country" error={errors.country}>
                            <NativeSelect
                                id="country"
                                name="country"
                                required
                                value={country}
                                autoComplete="country"
                                onChange={(e) => {
                                    setCountry(e.target.value);
                                    if (e.target.value) setPhoneCountry(e.target.value);
                                }}
                            >
                                <option value="" disabled>
                                    Select your country
                                </option>
                                {countries.map((c) => (
                                    <option key={c.code} value={c.code}>
                                        {flag(c.code)} {c.name}
                                    </option>
                                ))}
                            </NativeSelect>
                        </Field>

                        <label className="mt-1 flex items-start gap-3 rounded-xl bg-surface-2/60 p-3.5 text-[13px] leading-snug text-white/85 ring-1 ring-line/60">
                            <Checkbox id="terms" name="terms" value="1" required className="mt-0.5" />
                            <span>
                                I agree to the{' '}
                                <TextLink href="/legal/terms" target="_blank">
                                    Terms &amp; Conditions
                                </TextLink>{' '}
                                and{' '}
                                <TextLink href="/legal/privacy" target="_blank">
                                    Privacy Policy
                                </TextLink>
                                .
                            </span>
                        </label>
                        <InputError message={errors.terms} className="-mt-3" />

                        <Button type="submit" size="lg" className="w-full" data-test="register-user-button">
                            {processing && <Spinner />}
                            Create account &amp; get bonus
                        </Button>

                        <div className="text-center text-sm text-muted-foreground">
                            Already have an account? <TextLink href="/login">Log in</TextLink>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}

Register.layout = {
    title: 'Create your account',
    description: 'We need a few details to keep your account secure and payments working.',
};
