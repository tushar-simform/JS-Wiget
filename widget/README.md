# Slotted Widget Modal Integration

This widget now supports modal functionality that can be easily embedded in any React application or HTML page.

## How It Works

The widget script automatically detects if there's a button with ID `open-slotted-widget` and switches to modal mode:

- Hides the original widget container
- Creates a modal overlay
- Handles all modal interactions (open/close)

## Usage in React Application

### 1. Add the widget script to your React app

```jsx
// In your React component or in public/index.html
useEffect(() => {
  // Add widget container
  const widgetContainer = document.createElement("div");
  widgetContainer.id = "slotted-easyrfp";
  widgetContainer.setAttribute("data-widget-key", "your-widget-key");
  document.body.appendChild(widgetContainer);

  // Add widget script
  const script = document.createElement("script");
  script.src = "https://your-domain.com/widget.js?providerId=YOUR_PROVIDER_ID";
  document.body.appendChild(script);

  return () => {
    // Cleanup
    if (widgetContainer) document.body.removeChild(widgetContainer);
    if (script) document.body.removeChild(script);
  };
}, []);
```

### 2. Add the trigger button in your React component

```jsx
function MyComponent() {
  return (
    <div>
      <h1>My Application</h1>

      {/* This button will automatically trigger the widget modal */}
      <button id="open-slotted-widget">📋 Get RFP Quote</button>

      {/* Rest of your component */}
    </div>
  );
}
```

## Usage in Plain HTML

```html
<!DOCTYPE html>
<html>
  <head>
    <title>My Website</title>
  </head>
  <body>
    <!-- Your page content -->
    <h1>Welcome to My Website</h1>

    <!-- Trigger button -->
    <button id="open-slotted-widget">📋 Get RFP Quote</button>

    <!-- Widget container (will be hidden in modal mode) -->
    <div id="slotted-easyrfp" data-widget-key="your-widget-key"></div>

    <!-- Widget script -->
    <script src="https://your-domain.com/widget.js?providerId=YOUR_PROVIDER_ID"></script>
  </body>
</html>
```

## Features

✅ **Automatic Modal Detection** - Widget automatically switches to modal mode when trigger button is present
✅ **React Compatible** - Works seamlessly with React applications
✅ **No Configuration Required** - Just add the button with the correct ID
✅ **Responsive Design** - Modal adapts to different screen sizes
✅ **Accessibility** - ESC key and click-outside to close
✅ **Professional Styling** - Built-in modal styling with backdrop blur
✅ **Event Handling** - All modal interactions handled by the widget script

## Button ID Requirement

The trigger button **must** have the ID `open-slotted-widget`. The widget script looks for this specific ID to enable modal mode.

## Modal Behavior

- **Open**: Click the trigger button
- **Close**:
  - Click the × button in top-right corner
  - Click outside the modal
  - Press ESC key
- **Responsive**: Adapts to screen size with scrollable content
- **Overlay**: Semi-transparent backdrop with blur effect

## Example Integration

For a complete example, see the `index.html` file in this repository.
