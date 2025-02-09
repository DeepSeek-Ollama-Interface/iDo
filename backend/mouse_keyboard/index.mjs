import { execSync } from 'child_process';
import { platform } from 'os';

const os = platform();

export class MouseController {

  static #getScreenSize() {
    if (os === 'linux') {
      const output = execSync('xwininfo -root').toString();
      return {
        width: parseInt(output.match(/Width: (\d+)/)[1]),
        height: parseInt(output.match(/Height: (\d+)/)[1])
      };
    } else if (os === 'win32') {
      const output = execSync(
        'powershell -command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.Screen]::PrimaryScreen.Bounds"'
      ).toString();
      const [width, height] = output.split(', ').slice(2).map(Number);
      return { width, height };
    }
    return { width: 1920, height: 1080 };
  }

  static move(x, y, duration = 0) {
    const screen = this.#getScreenSize();
    x = Math.max(0, Math.min(x, screen.width));
    y = Math.max(0, Math.min(y, screen.height));

    if (os === 'linux') {
      if (duration > 0) {
        execSync(`xdotool mousemove --polar ${x} ${y} ${duration}`);
      } else {
        execSync(`xdotool mousemove ${x} ${y}`);
      }
    } else if (os === 'win32') {
      const psCommand = `
        Add-Type -AssemblyName System.Windows.Forms;
        $pos = [System.Windows.Forms.Cursor]::Position;
        ${duration > 0 ? `
          $steps = ${Math.ceil(duration / 10)};
          $dx = (${x} - $pos.X) / $steps;
          $dy = (${y} - $pos.Y) / $steps;
          1..$steps | ForEach-Object {
            [System.Windows.Forms.Cursor]::Position = New-Object System.Drawing.Point(
              ($pos.X + $dx * $_), 
              ($pos.Y + $dy * $_)
            );
            Start-Sleep -Milliseconds 10;
          }
        ` : `
          [System.Windows.Forms.Cursor]::Position = New-Object System.Drawing.Point(${x}, ${y});
        `}
      `;
      execSync(`powershell -Command "${psCommand.replace(/\n/g, '')}"`);
    }
  }
  
}

export class KeyboardController {

  static #keyMap = {
    linux: {
      enter: 'Return',
      ctrl: 'Control_L'
    },
    win32: {
      enter: 'ENTER',
      ctrl: 'CONTROL'
    }
  };

  static pressKey(key) {
    const normalizedKey = key.toLowerCase();
    
    if (os === 'linux') {
      const xKey = this.#keyMap.linux[normalizedKey] || key.toUpperCase();
      execSync(`xdotool key ${xKey}`);
    } else if (os === 'win32') {
      const vkKey = this.#keyMap.win32[normalizedKey] || key.toUpperCase();
      execSync(
        `powershell -Command "$wshell = New-Object -ComObject wscript.shell; $wshell.SendKeys('${vkKey}')"`
      );
    }
  }

  static typeText(text) {
    if (os === 'linux') {
      execSync(`xdotool type '${text.replace(/'/g, "'\\''")}'`);
    } else if (os === 'win32') {
      execSync(
        `powershell -Command "$wshell = New-Object -ComObject wscript.shell; $wshell.SendKeys('${text.replace(/'/g, "''")}')"`
      );
    }
  }

}
