import Cocoa
import AppKit

class AppDelegate: NSObject, NSApplicationDelegate {
    var statusItem: NSStatusItem?
    var dashboardProcess: Process?

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
        // 左眼
        NSColor.white.setFill()
        let leftEye = NSBezierPath(ovalIn: NSRect(x: 6, y: 6, width: 3, height: 3))
        leftEye.fill()
        NSColor.black.setFill()
        let leftPupil = NSBezierPath(ovalIn: NSRect(x: 7, y: 7, width: 1, height: 1))
        leftPupil.fill()

        // 右眼
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

        // 设置点击动作（支持左键和右键）
        button.action = #selector(statusBarButtonClicked)
        button.target = self
        button.sendAction(on: [.leftMouseUp, .rightMouseUp])

        // 初始化菜单
        updateMenu()

        Swift.print("✅ OpenClaw Dashboard 菜单栏应用已启动")
        Swift.print("📍 图标：红色龙虾 + 眼睛")
        Swift.print("💡 左键或右键点击显示菜单")
    }

    @objc func statusBarButtonClicked() {
        // 每次点击时更新菜单
        updateMenu()
    }

    // 检查 Dashboard 是否正在运行
    func isDashboardRunning() -> Bool {
        // 方法1: 检查我们启动的进程
        if let process = dashboardProcess, process.isRunning {
            return true
        }

        // 方法2: 检查系统中是否有 next dev 进程运行
        let task = Process()
        task.executableURL = URL(fileURLWithPath: "/usr/bin/pgrep")
        task.arguments = ["-f", "next dev"]

        do {
            try task.run()
            task.waitUntilExit()
            return task.terminationStatus == 0
        } catch {
            return false
        }
    }

    func updateMenu() {
        let menu = NSMenu()

        // 状态项 - 根据实际运行状态显示
        let statusMenuItem = NSMenuItem()
        statusMenuItem.isEnabled = false

        if isDashboardRunning() {
            statusMenuItem.title = "● Dashboard 运行中"
        } else {
            statusMenuItem.title = "○ Dashboard 已停止"
        }

        menu.addItem(statusMenuItem)
        menu.addItem(NSMenuItem.separator())

        // 启动/停止按钮
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

        // 打开 Dashboard
        let openItem = NSMenuItem(title: "打开 Dashboard", action: #selector(openDashboard), keyEquivalent: "o")
        openItem.target = self
        menu.addItem(openItem)

        menu.addItem(NSMenuItem.separator())

        // 退出
        let quitItem = NSMenuItem(title: "退出", action: #selector(quit), keyEquivalent: "q")
        quitItem.target = self
        menu.addItem(quitItem)

        // 将菜单设置到 statusItem
        statusItem?.menu = menu
    }

    @objc func startDashboard() {
        if isDashboardRunning() {
            Swift.print("⚠️ Dashboard 已经在运行")
            showAlert(message: "Dashboard 已经在运行中")
            return
        }

        Swift.print("🚀 启动 Dashboard 服务...")

        // 使用启动脚本
        let scriptPath = "/Users/alex/openclaw-dashboard/macos-menubar-native/start-dashboard.sh"

        guard FileManager.default.fileExists(atPath: scriptPath) else {
            Swift.print("❌ 找不到启动脚本: \(scriptPath)")
            showAlert(message: "找不到启动脚本")
            return
        }

        dashboardProcess = Process()
        dashboardProcess?.executableURL = URL(fileURLWithPath: scriptPath)

        do {
            try dashboardProcess?.run()
            Swift.print("✅ Dashboard 启动脚本已执行")

            // 3秒后更新菜单状态
            DispatchQueue.main.asyncAfter(deadline: .now() + 3.0) { [weak self] in
                self?.updateMenu()
            }
        } catch {
            Swift.print("❌ 启动失败: \(error)")
            showAlert(message: "启动失败: \(error.localizedDescription)")
        }
    }

    @objc func stopDashboard() {
        Swift.print("🛑 停止 Dashboard 服务...")

        // 停止我们启动的进程
        dashboardProcess?.terminate()

        // 使用 pkill 确保停止所有 next dev 进程
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

        if let url = URL(string: "http://localhost:3000") {
            NSWorkspace.shared.open(url)
        }
    }

    @objc func quit() {
        Swift.print("👋 退出应用")

        // 停止 Dashboard 进程
        if let process = dashboardProcess, process.isRunning {
            process.terminate()
        }

        NSApplication.shared.terminate(nil)
    }

    func showAlert(message: String) {
        let alert = NSAlert()
        alert.messageText = "OpenClaw Dashboard"
        alert.informativeText = message
        alert.alertStyle = .informational
        alert.runModal()
    }

    func startStatusCheck() {
        // 每2秒检查一次状态并更新菜单
        Timer.scheduledTimer(withTimeInterval: 2.0, repeats: true) { [weak self] _ in
            self?.updateMenu()
        }
    }
}

// 启动应用
let app = NSApplication.shared
let delegate = AppDelegate()
app.delegate = delegate

app.setActivationPolicy(.accessory)

delegate.startStatusCheck()

app.run()
