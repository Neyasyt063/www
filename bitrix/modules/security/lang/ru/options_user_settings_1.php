<?
$MESS ['SEC_OTP_NEW_ACCESS_DENIED'] = "���������� ����������� ������������ ����������.";
$MESS ['SEC_OTP_NEW_SWITCH_ON'] = "�������� ����������� �����������";
$MESS ['SEC_OTP_TYPE'] = "�������� ��������� ������";
$MESS ['SEC_OTP_SECRET_KEY'] = "��������� ���� (��������������� ������������� ��� ������� ����������)";
$MESS ['SEC_OTP_INIT'] = "�������������";
$MESS ['SEC_OTP_PASS1'] = "������ �������� ������ �� ���������� (������ � �������� � ������ �������)";
$MESS ['SEC_OTP_PASS2'] = "��������� �������� ������ �� ���������� (������ ��� ��� � �������� � ������ �������)";

$MESS ['SEC_OTP_DESCRIPTION_INTRO_TITLE'] = '����������� ������';
$MESS ['SEC_OTP_DESCRIPTION_INTRO_SITE'] = <<<'HTML'
��� ����������� �� ����� ����� ������ ������������
���������� ���� �������������� ����� � ������. �� ���������� ���������
���������, ������� �������� ������� ��� ������ � ���������� ������������
(��������, ����������� � �������� ������).<br>
��� �������������� ������ �� ����� ������������� �������� <b>����������� �����������</b>.
��� ����� ������ �� ��������� �������� � ������� ����������� � ���
�����. ������ � ��� �������� ����� � ������ ������������. ������ � ���
����������� ���, ������� ������ ������������ �������� �� ���������� �
����� ��������� �������� ��� �� ������������ ����������. � ����������,
���� ���� ����� � ������ ����� ��������, �������������� �� ������ ���
��������������� ��� ������������ ����.
HTML;

$MESS ['SEC_OTP_DESCRIPTION_INTRO_INTRANET'] = <<<'HTML'
��� ����������� � ����� �������24 ������ ������������
���������� ���� �������������� ����� � ������. �� ���������� ���������
���������, ������� �������� ������� ��� ������ � ���������� ������������
(��������, ����������� � �������� ������).<br>
��� �������������� ������ � �������24 ������������� �������� <b>����������� �����������</b>.
��� ����� ������ �� ��������� �������� � ������� ����������� � ���
�����. ������ � ��� �������� ����� � ������ ������������. ������ � ���
����������� ���, ������� ������ ������������ �������� �� ���������� �
����� ��������� �������� ��� �� ������������ ����������. � ����������,
���� ���� ����� � ������ ����� ��������, �������������� �� ������ ���
��������������� ��� ������������ ����.
HTML;

$MESS ['SEC_OTP_DESCRIPTION_USING_TITLE'] = '��� ������������';
$MESS ['SEC_OTP_DESCRIPTION_USING_STEP_0'] = '��� 1';
$MESS ['SEC_OTP_DESCRIPTION_USING_STEP_1'] = '��� 2';
$MESS ['SEC_OTP_DESCRIPTION_USING'] = <<<'HTML'
��� ��������� ����������� ����������� ������������ ����������� ������ ��� ����� ��� ����������� �� �����<br>
�� ������ �����, ��� � ������, ���������� ������� ���� E-mail/����� � ������<br>
�� ������ - ������ ����������� ���, ������� ����� �������� � ������� ������������ ������ ��� ���������� ��������.<br>
HTML;
$MESS ['SEC_OTP_DESCRIPTION_ACTIVATION_TITLE'] = '���������';
$MESS ['SEC_OTP_DESCRIPTION_ACTIVATION'] = <<<'HTML'
�������� ����������� ��� ��� ����������� ����������� ����� � ������� ������������ ���������� (������) ��� ����������� ���������� ���������� Bitrix OTP, �������������� � ������� ������������.<br>
��� ����������� ������ �������������� ����� ��������� ��������� � ������� ������������: ������� ��� ��������������� ��������������� ����������� ������, ���������� � ����������.<br>
��� ��������� ������������ ���� � ������� ���������� ���������� ������������ ����� �������������� ��������� �����������: ������� ��������� ����������, ��������� ���, ������� QR-��� �� �������� �������� � ����� ������� ��� ������� ������ ������ �������� �������.
HTML;
$MESS ['SEC_OTP_DESCRIPTION_ABOUT_TITLE'] = '��������';
$MESS ['SEC_OTP_DESCRIPTION_ABOUT'] = <<<'HTML'
������� ����������� � �������������� ����������� ������� (One-Time Password - OTP) ����������� � ������ ���������� OATH.<br>
���������� �������� �� ��������� HMAC � ���-������� SHA-1/SHA-256/SHA-512. �� ������� ������ �������������� ��� ��������� ���������:
<ul><li>�� �������� (HMAC-Based One-time Password, HOTP), ������ � <a href="https://tools.ietf.org/html/rfc4226" target="_blank">RFC4226</a></li>
<li>�� ������� (Time-based One-time Password, TOTP), ������ <a href="https://tools.ietf.org/html/rfc6238" target="_blank">RFC6238</a></li></ul>
��� ������� �������� OTP ����������� ��� ������� ��������� - ��������� ���� (��������� �������� ��� ����������) � ������� �������� �������� (���������� ����������� ������ ��������� ��� ������� �������, � ����������� �� ���������� ���������). ��������� �������� ��������
��� � ����� ����������, ��� � �� ����� ����� ������������� ����������. � ������ ������������� HOTP ���������, ������� � ���������� ������������� ��� ������ ��������� OTP, �� ������� - ��� ������ ������� �������������� �� OTP. � ������ ������������� TOTP ���������, ������� � ���������� �� ��������, �� ������� ���� �������������� ��������� ��������� �������� ������� ���������� ��� ������ ������� �������������� �� OTP.<br>
������ ��������� OTP ������������ � ������������� ������, ���������� ��������� �������� (��������� �����) ��� ���� ��������� ������,
���������� � �������� ������� ���������� (���������� �� ������� ����������).<br>
� ������ ��������� ������������� �������� ��������� � ���������� � �� �������, � ����� ����� ������������ - �������� �������� �� ������� � ������������ ��������, ����������� � ����������. ��� ����� ������������� ������� ��� ��� ������������ (��� ������� ��������������� ����������) ������ ������������� ��� ���������������� �������� ����������� ������� (OTP) � ������ �� � ����� �� �����.<br>
��������� ���������� ��� ��������� ������������ ������ �������� � GooglePlay � AppStore
HTML;

$MESS ['SEC_OTP_STATUS'] = "������� ������";
$MESS ['SEC_OTP_STATUS_ON'] = "���������";
$MESS['SEC_OTP_CONNECT_MOBILE_TITLE'] = '���������� �������';
$MESS['SEC_OTP_CONNECT_MOBILE_STEP_1'] = '�������� ��������� ���������� Bitrix OTP ��� ������ �������� �� <a href="https://itunes.apple.com/ru/app/bitrix24-otp/id929604673?l=ru" target="_new">AppStore</a> ��� <a href="https://play.google.com/store/apps/details?id=com.bitrixsoft.otp" target="_new">GooglePlay</a>';
$MESS['SEC_OTP_CONNECT_MOBILE_STEP_2'] = '��������� ���������� � ������� ������ <b>���������</b>';
$MESS['SEC_OTP_CONNECT_MOBILE_STEP_3'] = '�������� ������� ������ ����� ������ - ������������ ���� ��� ������ ����';
$MESS['SEC_OTP_CONNECT_MOBILE_SCAN_QR'] = '��� ����, ����� ����������� ���, ��������� ������ ���������� �������� � �������� � ��������� � ���������, ���� ���������� ��������� ���.';
$MESS['SEC_OTP_CONNECT_MOBILE_MANUAL_INPUT'] = '��� ������ ����� ���������� ������� ����� �����, ��� E-mail ��� �����, ��������� ���, ������� ������ �� ��������, � ������� ��� �����';
$MESS['SEC_OTP_CONNECT_MOBILE_MANUAL_INPUT_HOTP'] = '�� ��������';
$MESS['SEC_OTP_CONNECT_MOBILE_MANUAL_INPUT_TOTP'] = '�� �������';
$MESS['SEC_OTP_CONNECT_MOBILE_INPUT_DESCRIPTION'] = '����� ��������� ������������ ���� ��� ����� ������ ������� �� ������ ���������� �������� �������� ���, ������� ���������� ������ � ���� ����';
$MESS['SEC_OTP_CONNECT_MOBILE_ENTER_CODE'] = '������� ���';
$MESS['SEC_OTP_CONNECT_MOBILE_INPUT_NEXT_DESCRIPTION'] = '������������ �������� ��������� ����������� ������� ������� ������� ���� ����� ��� �������������, ����������, ������������ ��������� ��� � ������� � ���� ����';
$MESS['SEC_OTP_CONNECT_MOBILE_ENTER_NEXT_CODE'] = '������� ��������� ���';
$MESS['SEC_OTP_CONNECT_DONE'] = '������';
$MESS['SEC_OTP_CONNECT_DEVICE_TITLE'] = '���������� ������';
$MESS['SEC_OTP_CONNECTED'] = '���������';
$MESS['SEC_OTP_ENABLE'] = '��������';
$MESS['SEC_OTP_DISABLE'] = '���������';
$MESS['SEC_OTP_SYNC_NOW'] = '����������������';
$MESS['SEC_OTP_MOBILE_INPUT_METHODS_SEPARATOR'] = '���';
$MESS['SEC_OTP_MOBILE_SCAN_QR'] = '����������� QR-���';
$MESS['SEC_OTP_MOBILE_MANUAL_INPUT'] = '������ ������ �������';
$MESS['SEC_OTP_CONNECT_DEVICE'] = '���������� ������';
$MESS['SEC_OTP_CONNECT_MOBILE'] = '���������� �������';
$MESS['SEC_OTP_CONNECT_NEW_DEVICE'] = '���������� ����� ������';
$MESS['SEC_OTP_CONNECT_NEW_MOBILE'] = '���������� ����� �������';
$MESS['SEC_OTP_ERROR_TITLE'] = '������ ����������';
$MESS['SEC_OTP_UNKNOWN_ERROR'] = '�������������� ������. ��������� ������� �����.';
$MESS['SEC_OTP_RECOVERY_CODES_BUTTON'] = '��������� ����';
$MESS['SEC_OTP_RECOVERY_CODES_TITLE'] = '��������� ����';
$MESS['SEC_OTP_RECOVERY_CODES_DESCRIPTION'] = '���������� ��������� ��������� ����, ������� ����� ������������� � ������ ����� ���������� �������� ��� ������ ���������, ����� ��������� ���� � ���������� ����� ����������.';
$MESS['SEC_OTP_RECOVERY_CODES_WARNING'] = '������� �� ��� �����, ��������, � ���������. ������ ����� ����� ��������������� ������ ���� ���';
$MESS['SEC_OTP_RECOVERY_CODES_PRINT'] = '��������';
$MESS['SEC_OTP_RECOVERY_CODES_SAVE_FILE'] = '��������� � ��������� ����';
$MESS['SEC_OTP_RECOVERY_CODES_REGENERATE_DESCRIPTION'] = '������������� ��������� ����? �������� �����<br>������������� ������ ����, ��������� ����������.';
$MESS['SEC_OTP_RECOVERY_CODES_REGENERATE'] = '������������� ����� ����';
$MESS['SEC_OTP_RECOVERY_CODES_NOTE'] = '������ ��� ����� ������������ ������ ���� ���. �����. ������������ �������������� ����.';
$MESS['SEC_OTP_WARNING_RECOVERY_CODES'] = '����������� ����������� ��������, ������ �� �� ��������� ���� ��������� ����. ��� ����� ������������� � ������ ����� ���������� �������� ��� ������ ���������, ����� ��������� ���� � ���������� ����� ����������.';
$MESS['SEC_OTP_STATUS'] = '������';
$MESS['SEC_OTP_NO_DAYS'] = '���������';
$MESS['SEC_OTP_DEACTIVATE_UNTIL'] = '��������� �� #DATE#';
$MESS['SEC_OTP_MANDATORY_EXPIRED'] = '������, � ������� �������� ������������ ������ ��� ��������� ����������� ����������� �����.';
$MESS['SEC_OTP_MANDATORY_ALMOST_EXPIRED'] = '������, � ������� �������� ������������ ������ ��������� ����������� ����������� �������� #DATE#.';
$MESS['SEC_OTP_MANDATORY_DISABLED'] = '���������� ������������� ����������� ����������� ����������� ���������.';
$MESS['SEC_OTP_MANDATORY_ENABLE_DEFAULT'] = '��������� �����������';
$MESS['SEC_OTP_MANDATORY_ENABLE'] = '��������� ����������� �����';
$MESS['SEC_OTP_MANDATORY_DEFFER'] = '��������';