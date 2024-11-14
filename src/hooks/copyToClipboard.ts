export default function copyToClipboard(text: string) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed"; // 화면에서 보이지 않도록 고정
  textArea.style.opacity = "0";
  document.body.appendChild(textArea);

  textArea.select();
  try {
    const successful = document.execCommand("copy");
    if (successful) {
    } else {
      throw new Error("Copy command was unsuccessful");
    }
  } catch (error) {
    console.error("Failed to copy text to clipboard", error);
    alert("Failed to copy link. Please try again.");
  } finally {
    document.body.removeChild(textArea);
  }
}
