<?php
$inData = getRequestInfo();


$userId    = $inData["userId"] ?? 0;
$contactId = $inData["contactId"] ?? 0;

if ($userId <= 0 || $contactId <= 0)
{
    returnWithError("Missing or invalid userId or contactId");
}

$conn = new mysqli("localhost", "User", "rR32h@1khlL", "COP4331");
if ($conn->connect_error)
{
    returnWithError("DB connect error: " . $conn->connect_error);
}

// Delete using BOTH contactId AND userId
// This prevents a user from deleting another user's contact

$stmt = $conn->prepare(
    "DELETE FROM contacts
     WHERE ID = ? AND UserID = ?"
);

if (!$stmt)
{
    $conn->close();
    returnWithError("Prepare failed: " . $conn->error);
}

$stmt->bind_param("ii", $contactId, $userId);

if (!$stmt->execute())
{
    $err = $stmt->error;
    $stmt->close();
    $conn->close();
    returnWithError("Execute failed: " . $err);
}

// If affected_rows == 0: contact doesn't exist OR belongs to a different user

if ($stmt->affected_rows === 0)
{
    $stmt->close();
    $conn->close();
    returnWithError("No contact deleted (not found or not authorized)");
}

$stmt->close();
$conn->close();

sendResultInfoAsJson(json_encode([
    "success" => true,
    "error"   => ""
]));
exit();

function getRequestInfo()
{
    return json_decode(file_get_contents("php://input"), true);
}

function sendResultInfoAsJson($obj)
{
    header("Content-Type: application/json");
    echo $obj;
}

function returnWithError($err)
{
    sendResultInfoAsJson(json_encode([
        "success" => false,
        "error"   => $err
    ]));
    exit();
}
