import Cocoa
import AppKit

class AppDelegate: NSObject, NSApplicationDelegate {
    var statusItem: NSStatusItem?
    var dashboardProcess: Process?
    var nodePath: String?
    var nextPath: String?
    var portNumber: Int = 3000  // 默认端口号

    func applicationDidFinishLaunching(_ notification: Notification) {
        // 创建状态栏项目
        statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)

        guard let statusItem = statusItem, let button = statusItem.button else {
            Swift.print("❌ 无法创建状态栏项目")
            return
        }

        Swift.print("✅ 状态栏项目已创建")

        // 创建自定义图标（龙虾 + 眼睛）
        let iconSize = NSSize(width: 18, height: 18)
        let image = NSImage(size: iconSize)
        image.lockFocus()

        // 龙虾身体（红色椭圆）
        NSColor.systemRed.setFill()
        let body = NSBezierPath(ovalIn: NSRect(x: 4, y: 8, width: 10, height: 6))
        body.fill()

        // 龙虾钳子（红色小椭圆）
        let leftClaw = NSBezierPath(ovalIn: NSRect(x: 1, y: 9, width: 4, height: 3))
        leftClaw.fill()
        let rightClaw = NSBezierPath(ovalIn: NSRect(x: 13, y: 9, width: 4, height: 3))
        rightClaw.fill()

        // 眼睛（白色圆圈 + 黑色瞳孔）
        NSColor.white.setFill()
        let leftEye = NSBezierPath(ovalIn: NSRect(x: 6, y: 6, width: 3, height: 3))
        leftEye.fill()
        NSColor.black.setFill()
        let leftPupil = NSBezierPath(ovalIn: NSRect(x: 7, y: 7, width: 1, height: 1))
        leftPupil.fill()

        NSColor.white.setFill()
        let rightEye = NSBezierPath(ovalIn: NSRect(x: 10, y: 6, width: 3, height: 3))
        rightEye.fill()
        NSColor.black.setFill()
        let rightPupil = NSBezierPath(ovalIn: NSRect(x: 11, y: 7, width: 1, height: 1))
        rightPupil.fill()

        // 龙虾触须（线条）
        NSColor.systemRed.setStroke()
        let leftWhisker = NSBezierPath()
        leftWhisker.move(to: NSPoint(x: 6, y: 6))
        leftWhisker.line(to: NSPoint(x: 4, y: 3))
        leftWhisker.lineWidth = 1.0
        leftWhisker.stroke()

        let rightWhisker = NSBezierPath()
        rightWhisker.move(to: NSPoint(x: 12, y: 6))
        rightWhisker.line(to: NSPoint(x: 14, y: 3))
        rightWhisker.lineWidth = 1.0
        rightWhisker.stroke()

        image.unlockFocus()

        // 设置图标
        button.image = image

        // 设置点击动作
        button.action = #selector(statusBarButtonClicked)
        button.target = self
        button.sendAction(on: [.leftMouseUp, .rightMouseUp])

        // 查找 Node.js 路径
        findNodePaths()

        // 初始化菜单
        updateMenu()

        Swift.print("✅ OpenClaw Dashboard 菜单栏应用已启动")
        if let node = nodePath {
            Swift.print("📍 Node.js: \(node)")
        } else {
            Swift.print("⚠️ 未找到 Node.js")
        }
    }

    @objc func statusBarButtonClicked() {
        updateMenu()
    }

    func findNodePaths() {
        // 优先查找应用包内的 Node.js
        let bundlePath = Bundle.main.bundlePath
        let bundledNode = bundlePath + "/Contents/Resources/node"
        let bundledNext = bundlePath + "/Contents/Resources/node_modules/.bin/next"

        if FileManager.default.fileExists(atPath: bundledNode) {
            nodePath = bundledNode
            Swift.print("使用打包的 Node.js: \(bundledNode)")
        }

        if FileManager.default.fileExists(atPath: bundledNext) {
            nextPath = bundledNext
            Swift.print("使用打包的 Next.js: \(bundledNext)")
        }

        // 如果没有打包的 Node.js，查找系统安装的
        if nodePath == nil {
            let possiblePaths = [
                "/Users/alex/.nvm/versions/node/v24.14.0/bin/node",
                "/opt/homebrew/bin/node",
                "/usr/local/bin/node",
                "/usr/bin/node"
            ]

            for path in possiblePaths {
                if FileManager.default.fileExists(atPath: path) {
                    nodePath = path
                    Swift.print("使用系统的 Node.js: \(path)")
                    break
                }
            }
        }

        // 如果还是没有找到，查找 PATH 中的
        if nodePath == nil {
            if let pathEnv = ProcessInfo.processInfo.environment["PATH"] {
                let searchPaths = pathEnv.split(separator: ":").map(String.init)
                for searchPath in searchPaths {
                    let nodePathInPath = "\(searchPath)/node"
                    if FileManager.default.fileExists(atPath: nodePathInPath) {
                        nodePath = nodePathInPath
                        Swift.print("从 PATH 找到 Node.js: \(nodePathInPath)")
                        break
                    }
                }
            }
        }

        // 查找 Next.js
        if nextPath == nil {
            let dashboardPath = "/Users/alex/openclaw-dashboard"
            let localNext = dashboardPath + "/node_modules/.bin/next"

            if FileManager.default.fileExists(atPath: localNext) {
                nextPath = localNext
            }
        }
    }

    func isDashboardRunning() -> Bool {
        // 首先检查我们启动的进程
        if let process = dashboardProcess, process.isRunning {
            return true
        }

        // 更精确的检测：查找包含 openclaw-dashboard 路径的 next dev 进程
        let task = Process()
        task.executableURL = URL(fileURLWithPath: "/usr/bin/pgrep")
        task.arguments = ["-f", "openclaw-dashboard.*next dev"]

        do {
            try task.run()
            task.waitUntilExit()
            let hasProcess = task.terminationStatus == 0

            // 额外验证：检查 localhost:3000 端口是否可访问
            if hasProcess {
                return isServerResponding()
            }

            return false
        } catch {
            return false
        }
    }

    func isServerResponding() -> Bool {
        let url = URL(string: "http://localhost:\(portNumber)")!
        var request = URLRequest(url: url)
        request.timeoutInterval = 1.0

        let semaphore = DispatchSemaphore(value: 0)
        var isResponding = false

        let task = URLSession.shared.dataTask(with: request) { data, response, error in
            if let httpResponse = response as? HTTPURLResponse {
                let statusCode = httpResponse.statusCode
                // 接受 2xx (成功) 或 3xx (重定向) 状态码
                isResponding = (200...299).contains(statusCode) || (300...399).contains(statusCode)
            }
            semaphore.signal()
        }

        task.resume()
        semaphore.wait()

        return isResponding
    }

    func updateMenu() {
        let menu = NSMenu()

        let statusMenuItem = NSMenuItem()
        statusMenuItem.isEnabled = false

        if isDashboardRunning() {
            // 绿色状态
            let statusText = "● Dashboard 运行中"
            let attributedString = NSMutableAttributedString(string: statusText)
            let range = NSRange(location: 0, length: statusText.count)
            attributedString.addAttribute(.foregroundColor, value: NSColor.systemGreen, range: range)
            statusMenuItem.attributedTitle = attributedString
        } else {
            // 灰色状态
            let statusText = "○ Dashboard 已停止"
            let attributedString = NSMutableAttributedString(string: statusText)
            let range = NSRange(location: 0, length: statusText.count)
            attributedString.addAttribute(.foregroundColor, value: NSColor.systemGray, range: range)
            statusMenuItem.attributedTitle = attributedString
        }

        menu.addItem(statusMenuItem)
        menu.addItem(NSMenuItem.separator())

        if isDashboardRunning() {
            let stopItem = NSMenuItem(title: "停止服务", action: #selector(stopDashboard), keyEquivalent: "")
            stopItem.target = self
            menu.addItem(stopItem)
        } else {
            let startItem = NSMenuItem(title: "启动服务", action: #selector(startDashboard), keyEquivalent: "")
            startItem.target = self
            menu.addItem(startItem)
        }

        menu.addItem(NSMenuItem.separator())

        // 显示当前端口号
        let portInfoItem = NSMenuItem()
        portInfoItem.isEnabled = false
        portInfoItem.title = "端口: \(portNumber)"
        menu.addItem(portInfoItem)

        let openItem = NSMenuItem(title: "打开 Dashboard", action: #selector(openDashboard), keyEquivalent: "o")
        openItem.target = self
        menu.addItem(openItem)

        menu.addItem(NSMenuItem.separator())

        let quitItem = NSMenuItem(title: "退出", action: #selector(quit), keyEquivalent: "q")
        quitItem.target = self
        menu.addItem(quitItem)

        statusItem?.menu = menu
    }

    @objc func startDashboard() {
        if isDashboardRunning() {
            Swift.print("⚠️ Dashboard 已经在运行")
            showAlert(message: "Dashboard 已经在运行中")
            return
        }

        // 弹出对话框让用户输入端口号
        let portInput = showPortInputDialog()
        guard let port = portInput, let portNum = Int(port), portNum >= 1024 && portNum <= 65535 else {
            showAlert(message: "请输入有效的端口号（1024-65535）")
            return
        }

        portNumber = portNum
        Swift.print("🚀 启动 Dashboard 服务 (端口: \(portNumber))...")

        // 确保 Node.js 路径已更新
        findNodePaths()

        guard let node = nodePath else {
            Swift.print("❌ 找不到 Node.js")
            showAlert(message: "找不到 Node.js。\n\n请安装 Node.js:\n1. 访问 https://nodejs.org\n2. 或使用 Homebrew: brew install node\n3. 或使用 nvm: curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash")
            return
        }

        guard let next = nextPath else {
            Swift.print("❌ 找不到 Next.js")
            showAlert(message: "找不到 Next.js。\n\n请在项目目录运行: npm install")
            return
        }

        Swift.print("使用 Node.js: \(node)")
        Swift.print("使用 Next.js: \(next)")

        dashboardProcess = Process()
        dashboardProcess?.executableURL = URL(fileURLWithPath: node)
        dashboardProcess?.arguments = [next, "dev", "--port", "\(portNumber)"]
        dashboardProcess?.currentDirectoryURL = URL(fileURLWithPath: "/Users/alex/openclaw-dashboard")

        do {
            try dashboardProcess?.run()
            Swift.print("✅ Dashboard 启动命令已执行 (端口: \(portNumber))")

            // 显示等待提示
            showAlert(message: "Dashboard 正在启动中...\n\n端口: \(portNumber)\n\n请等待 5-10 秒让服务完全启动，然后再点击「打开 Dashboard」。\n\n启动完成后，图标会变为绿色圆点。")

            // 5秒后更新菜单状态
            DispatchQueue.main.asyncAfter(deadline: .now() + 5.0) { [weak self] in
                self?.updateMenu()
                Swift.print("✅ 菜单状态已更新")
            }
        } catch {
            Swift.print("❌ 启动失败: \(error)")
            showAlert(message: "启动失败: \(error.localizedDescription)")
        }
    }

    @objc func stopDashboard() {
        Swift.print("🛑 停止 Dashboard 服务...")

        dashboardProcess?.terminate()

        let task = Process()
        task.executableURL = URL(fileURLWithPath: "/usr/bin/pkill")
        task.arguments = ["-f", "next dev"]

        do {
            try task.run()
            task.waitUntilExit()

            DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) { [weak self] in
                self?.dashboardProcess = nil
                self?.updateMenu()
                Swift.print("✅ Dashboard 已停止")
            }
        } catch {
            Swift.print("❌ 停止失败: \(error)")
        }
    }

    @objc func openDashboard() {
        Swift.print("🌐 打开 Dashboard...")

        // 检查 Dashboard 是否正在运行
        if !isDashboardRunning() {
            showAlert(message: "Dashboard 尚未启动。\n\n请先点击「启动服务」按钮启动 Dashboard。")
            return
        }

        // 检查服务器是否已经就绪
        if isServerResponding() {
            // 服务器已就绪，直接打开浏览器到中文页面
            Swift.print("✅ 服务器已就绪，打开浏览器")
            if let url = URL(string: "http://localhost:\(portNumber)/zh") {
                NSWorkspace.shared.open(url)
            }
        } else {
            // 服务器尚未就绪，显示提示并等待
            Swift.print("⏳ 服务器尚未就绪，等待中...")
            checkServerAndOpen()
        }
    }

    func checkServerAndOpen() {
        let checkUrl = URL(string: "http://localhost:\(portNumber)")
        var request = URLRequest(url: checkUrl!)
        request.timeoutInterval = 2.0

        let currentPort = portNumber  // 捕获当前端口号

        let task = URLSession.shared.dataTask(with: request) { data, response, error in
            DispatchQueue.main.async {
                if error == nil, let httpResponse = response as? HTTPURLResponse {
                    // 接受任何 2xx 或 3xx 状态码作为服务器就绪的标志
                    let statusCode = httpResponse.statusCode
                    let isSuccess = (200...299).contains(statusCode) || (300...399).contains(statusCode)

                    if isSuccess {
                        // 服务器已就绪，打开浏览器到中文页面
                        Swift.print("✅ 服务器已就绪 (HTTP \(statusCode))，打开浏览器")
                        if let openUrl = URL(string: "http://localhost:\(currentPort)/zh") {
                            NSWorkspace.shared.open(openUrl)
                        }
                    } else {
                        // 服务器尚未就绪，1秒后重试
                        Swift.print("⏳ 服务器尚未就绪 (HTTP \(statusCode))，等待中...")
                        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) { [weak self] in
                            self?.checkServerAndOpen()
                        }
                    }
                } else {
                    // 请求失败，1秒后重试
                    Swift.print("⏳ 请求失败，等待中... 错误: \(error?.localizedDescription ?? "unknown")")
                    DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) { [weak self] in
                        self?.checkServerAndOpen()
                    }
                }
            }
        }
        task.resume()
    }

    @objc func quit() {
        Swift.print("👋 退出应用")

        if let process = dashboardProcess, process.isRunning {
            process.terminate()
        }

        NSApplication.shared.terminate(nil)
    }

    func showPortInputDialog() -> String? {
        let alert = NSAlert()
        alert.messageText = "设置端口号"
        alert.informativeText = "请输入 Dashboard 服务运行的端口号\n（默认: 3000，范围: 1024-65535）"
        alert.alertStyle = .informational
        alert.addButton(withTitle: "确定")
        alert.addButton(withTitle: "取消")

        let input = NSTextField(frame: NSRect(x: 0, y: 0, width: 300, height: 24))
        input.placeholderString = "3000"
        input.stringValue = "\(portNumber)"
        alert.accessoryView = input

        let response = alert.runModal()

        if response == .alertFirstButtonReturn {
            let portText = input.stringValue.trimmingCharacters(in: .whitespaces)
            if !portText.isEmpty {
                return portText
            }
        }

        return nil
    }

    func showAlert(message: String) {
        let alert = NSAlert()
        alert.messageText = "OpenClaw Dashboard"
        alert.informativeText = message
        alert.alertStyle = .informational
        alert.runModal()
    }

    func startStatusCheck() {
        Timer.scheduledTimer(withTimeInterval: 2.0, repeats: true) { [weak self] _ in
            self?.updateMenu()
        }
    }
}

let app = NSApplication.shared
let delegate = AppDelegate()
app.delegate = delegate

app.setActivationPolicy(.accessory)

delegate.startStatusCheck()

app.run()
