import * as React from "react"

const Dialog = ({ children }: any) => <div className="dialog">{children}</div>
const DialogContent = ({ children }: any) => <div className="dialog-content">{children}</div>
const DialogHeader = ({ children }: any) => <div className="dialog-header">{children}</div>
const DialogTitle = ({ children }: any) => <div className="dialog-title">{children}</div>
const DialogFooter = ({ children }: any) => <div className="dialog-footer">{children}</div>

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter }
