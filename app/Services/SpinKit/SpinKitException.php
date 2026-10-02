<?php

namespace App\Services\SpinKit;

use RuntimeException;

class SpinKitException extends RuntimeException
{
    public function __construct(
        string $message,
        public readonly ?string $errorCode = null,
        public readonly int $status = 0,
    ) {
        parent::__construct($message, $status);
    }

    public function is(string $code): bool
    {
        return $this->errorCode === $code;
    }
}
